import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const sec = 1000
  const showNotification = (msg: string, timeout: number, cancellable: boolean = false, progressbar: boolean = false) => {
    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: msg,
        cancellable: cancellable,
      },
      async (progress, token) => {
        return new Promise<void>(resolve => {
          setTimeout(() => { resolve() }, timeout)

          if (progressbar) {
            for (let i = 0; i < 100; i++) {
              let timer = i * 0.01 * timeout
              setTimeout(() => { progress.report({ increment: 1 }) }, timer)
            }
          }
        })
      }
    )
  }
  const onEndTask = (name: string) => {
    const config = vscode.workspace.getConfiguration("tasknotify-fork");
    const type = config.type;
    const timeout = config.timeout * sec;
    const msg = `Task "${name}" is done ✔️`

    if (type === 'notification') showNotification(msg, timeout, config.notification.cancellable, config.notification.progress)
    else if (type === 'statusbar') vscode.window.setStatusBarMessage(msg, timeout);
  }

  const taskProcessEnd = vscode.tasks.onDidEndTaskProcess((e) => {
    if (e.exitCode != 0) return

    onEndTask(e.execution.task.name);
  });
  const taskEnd = vscode.tasks.onDidEndTask((e) => {
    if (typeof e.execution.task.execution !== undefined) return

    onEndTask(e.execution.task.name);
  });

  context.subscriptions.push(taskProcessEnd, taskEnd);
}

export function deactivate() { }
