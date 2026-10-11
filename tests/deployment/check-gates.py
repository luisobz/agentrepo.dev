"""Evaluate actual Actions deployment conditions against failed prerequisite states."""
import re
import sys
from pathlib import Path
from types import SimpleNamespace as NS

workflow = Path(sys.argv[1] if len(sys.argv) > 1 else '.github/workflows/deploy.yml').read_text()
for name in ('web', 'admin', 'backend-web', 'backend-ai'):
    block = re.search(rf'^  {name}:\n(.*?)(?=^  [\w-]+:|\Z)', workflow, re.M | re.S).group(1)
    condition = re.search(r'^    if: \$\{\{ (.*?) \}\}$', block, re.M).group(1)
    dependencies = re.search(r'^    needs: \[(.*?)\]', block, re.M).group(1).split(', ')
    assert 'rehearse-migrations' in dependencies, f'{name}: rehearsal must be a direct dependency'
    expression = condition.replace('needs.rehearse-migrations', 'needs.rehearsal').replace('needs.backend-web', 'needs.backend_web').replace('&&', ' and ').replace('||', ' or ').replace('!cancelled()', 'True')
    for rehearsal, migration, expected in [('success','success',True),('failure','skipped',False),('cancelled','skipped',False),('success','failure',False),('success','skipped',False)]:
        needs = NS(backend_web=NS(result='success'), verify=NS(result='success'), rehearsal=NS(result=rehearsal), migrate=NS(result=migration))
        actual = eval(expression, {'__builtins__': {}}, {'needs': needs, 'github': NS(event_name='push'), 'inputs': NS(only='all')})
        assert actual == expected, f'{name}: unsafe gate with rehearsal={rehearsal}, migration={migration}'
    if name == 'web':
        assert 'backend-web' in dependencies, 'web must deploy after its API'
        for api in ('failure', 'cancelled', 'skipped'):
            needs = NS(verify=NS(result='success'), rehearsal=NS(result='success'), migrate=NS(result='success'), backend_web=NS(result=api))
            assert not eval(expression, {'__builtins__': {}}, {'needs': needs, 'github': NS(event_name='push'), 'inputs': NS(only='all')}), f'web: must not publish before API with state {api}'
        needs.backend_web.result = 'skipped'
        assert eval(expression, {'__builtins__': {}}, {'needs': needs, 'github': NS(event_name='workflow_dispatch'), 'inputs': NS(only='web')}), 'explicit web-only redeploy must remain available'
print('Deployment gates: all four applications fail closed for failed or skipped prerequisites')
