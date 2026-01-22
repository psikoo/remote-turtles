import { DatabaseManager, electronManager, TurtleManager, WsManager } from './managers/main';

electronManager.init(true);
WsManager.init(8080);
DatabaseManager.init();
TurtleManager.init();