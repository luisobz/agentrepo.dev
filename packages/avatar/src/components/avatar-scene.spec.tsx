import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { AvatarProvider, useAvatar } from './avatar-context';
import { AvatarScene } from './avatar-scene';
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
function HostProbe() {
  const { isSuspended } = useAvatar();
  return <span data-testid="suspended">{String(isSuspended)}</span>;
}
it('suspends the floating mascot while a two-character scene is visible and restores it on removal', () => {
  let visibility: (entries: { isIntersecting: boolean }[]) => void = () => {};
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: typeof visibility) {
        visibility = callback;
      }
      observe() {}
      disconnect() {}
    },
  );
  const actors = [
    {
      character: 'developer' as const,
      label: 'Development',
      message: 'Implementation',
    },
    {
      character: 'guardian' as const,
      label: 'Security',
      message: 'Verification',
    },
  ] as const;
  const { rerender } = render(
    <AvatarProvider>
      <HostProbe />
      <AvatarScene actors={actors} />
    </AvatarProvider>,
  );
  expect(
    screen.getAllByRole('button', { name: /Development|Security/ }),
  ).toHaveLength(2);
  act(() => visibility([{ isIntersecting: true }]));
  expect(screen.getByTestId('suspended')).toHaveTextContent('true');
  act(() => visibility([{ isIntersecting: false }]));
  expect(screen.getByTestId('suspended')).toHaveTextContent('false');
  act(() => visibility([{ isIntersecting: true }]));
  fireEvent.click(screen.getByRole('button', { name: 'Development' }));
  expect(screen.getByRole('status')).toHaveTextContent('Implementation');
  fireEvent.click(screen.getByRole('button', { name: 'Security' }));
  expect(screen.getAllByRole('status')).toHaveLength(1);
  expect(screen.getByRole('status')).toHaveTextContent('Verification');
  rerender(
    <AvatarProvider>
      <HostProbe />
    </AvatarProvider>,
  );
  expect(screen.getByTestId('suspended')).toHaveTextContent('false');
});
it('shows at most two characters and works without a floating host', () => {
  render(
    <AvatarScene
      actors={[{ character: 'repo', label: 'Repo', message: 'Hello' }]}
    />,
  );
  expect(screen.getAllByRole('button')).toHaveLength(1);
});
it('releases independent suspension leases without reviving a hidden mascot', () => {
  let host: ReturnType<typeof useAvatar>;
  function Probe() {
    host = useAvatar();
    return <HostProbe />;
  }
  render(
    <AvatarProvider>
      <Probe />
    </AvatarProvider>,
  );
  let a: () => void, b: () => void;
  act(() => {
    a = host.suspendAvatar();
    b = host.suspendAvatar();
  });
  expect(screen.getByTestId('suspended')).toHaveTextContent('true');
  act(() => {
    a();
    a();
  });
  expect(screen.getByTestId('suspended')).toHaveTextContent('true');
  act(() => b());
  expect(screen.getByTestId('suspended')).toHaveTextContent('false');
});
