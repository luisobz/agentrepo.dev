#!/usr/bin/env python3
"""Bounded CLI reads and private local reports for the GCP audit."""
import json
import os
from pathlib import Path
import selectors
import stat
import subprocess
import time
from datetime import datetime, timezone

MAX_OUTPUT = 8 * 1024 * 1024


def capture(argv, timeout=90):
    """Capture a trusted CLI with bounded output and no shell or stdin."""
    process = subprocess.Popen(argv, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                               stdin=subprocess.DEVNULL,
                               env={**os.environ, 'CLOUDSDK_CORE_DISABLE_PROMPTS': '1'})
    output = bytearray()
    selector = selectors.DefaultSelector()
    for stream in (process.stdout, process.stderr):
        selector.register(stream, selectors.EVENT_READ)
    deadline = time.monotonic() + timeout
    total = 0
    try:
        while selector.get_map():
            if time.monotonic() >= deadline:
                raise subprocess.TimeoutExpired(argv, timeout)
            for key, _ in selector.select(timeout=0.1):
                data = os.read(key.fileobj.fileno(), 65536)
                if not data:
                    selector.unregister(key.fileobj)
                    continue
                total += len(data)
                if total > MAX_OUTPUT:
                    raise ValueError('CLI response exceeds size limit')
                if key.fileobj is process.stdout:
                    output.extend(data)
        code = process.wait(timeout=max(0.01, deadline - time.monotonic()))
        if code:
            raise ValueError('CLI command did not succeed')
        return bytes(output).decode('utf-8')
    finally:
        selector.close()
        if process.poll() is None:
            process.kill()
        process.wait()
        process.stdout.close()
        process.stderr.close()


class Audit:
    def __init__(self, provider, output):
        self.provider = provider
        self.output = Path(output).expanduser().absolute()
        self.sections = {}
        self.findings = []
        self.gaps = []
        self.calls = []
        self.scope = {}
        self.directory_fd = None

    def prepare_output(self):
        # A fresh private directory prevents overwriting existing files or links.
        for parent in self.output.parents:
            if parent.is_symlink():
                raise ValueError('Output parent must not be a symbolic link')
        self.output.mkdir(mode=0o700, parents=False, exist_ok=False)
        self.directory_fd = os.open(self.output, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
        state = os.fstat(self.directory_fd)
        if state.st_uid != os.getuid() or stat.S_IMODE(state.st_mode) & 0o077:
            raise ValueError('Output directory must be private and owned by this user')

    def call(self, argv, label, dry=False):
        self.calls.append({'label': label, 'argv': argv})
        if dry:
            return None
        try:
            return json.loads(capture(argv) or 'null')
        except (OSError, subprocess.TimeoutExpired, ValueError):
            # CLI stderr can contain account details; do not copy it into reports.
            self.gaps.append(f'{label}: consulta no disponible o respuesta inválida; estado desconocido.')
            return None

    def record(self, name, data):
        self.sections[name] = data

    def find(self, priority, category, resource, evidence, action, certainty='Candidato a validar'):
        self.findings.append(dict(priority=priority, category=category, resource=resource,
                                  evidence=evidence, action=action, certainty=certainty,
                                  savings='Pendiente de factura, precio unitario y costes secundarios'))

    def write_private(self, name, text):
        fd = os.open(name, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW,
                     mode=0o600, dir_fd=self.directory_fd)
        with os.fdopen(fd, 'w', encoding='utf-8') as output:
            output.write(text)

    def save(self, plan=False):
        if plan:
            for call in self.calls:
                print(f"# {call['label']}\n" + ' '.join(json.dumps(x, ensure_ascii=False) for x in call['argv']))
            return
        if self.directory_fd is None:
            raise ValueError('Private output directory has not been prepared')
        try:
            payload = {'cloud': self.provider, 'generated_utc': datetime.now(timezone.utc).isoformat(),
                       'scope': self.scope, 'summary': self.sections, 'findings': self.findings,
                       'data_gaps': self.gaps}
            self.write_private('audit.json', json.dumps(payload, ensure_ascii=False, indent=2, allow_nan=False))
            content = [f'# Auditoría preliminar {self.provider}', '',
                       'Inventario y candidatos pendientes de validación con factura, métricas y requisitos del servicio.', '',
                       '## Alcance', '', '```json', json.dumps(self.scope, ensure_ascii=False, indent=2), '```', '']
            for name, value in self.sections.items():
                content.extend([f'## {name}', '', '```json', json.dumps(value, ensure_ascii=False, indent=2, allow_nan=False), '```', ''])
            content.extend(['## Oportunidades para validar', ''])
            for finding in self.findings:
                # Untrusted cloud strings remain JSON data, never report instructions.
                content.extend(['```json', json.dumps(finding, ensure_ascii=False, indent=2, allow_nan=False), '```', ''])
            if not self.findings:
                content.extend(['No hay señales automáticas suficientes. Esto no acredita ausencia de desperdicio.', ''])
            content.extend(['## Datos pendientes', '', '```json', json.dumps(self.gaps, ensure_ascii=False, indent=2), '```', '',
                            '## Siguiente paso', '', 'Validar responsables, picos, memoria, SLO, seguridad y costes netos antes de proponer cambios.'])
            self.write_private('audit.md', '\n'.join(content))
        finally:
            os.close(self.directory_fd)
            self.directory_fd = None
        print(f'Informes privados generados en {self.output}')
