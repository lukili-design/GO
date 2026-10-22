import {LotteryScreen} from './components/activity/LotteryScreen';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WorkspaceShell } from './components/WorkspaceShell';

export default function App() {
  const screen=new URLSearchParams(window.location.search).get('lotteryScreen');
  if(screen)return <LotteryScreen id={screen}/>;
  return (
    <div className="w-full min-h-screen bg-white dark:bg-slate-950">
      <WorkspaceShell />
    </div>
  );
}
