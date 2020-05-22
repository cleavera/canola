import { BattleReport } from '../classes/battle-report';
import { Mob } from '../classes/mob';
import { Recall } from '../classes/recall';

export type INewsContent = Mob | BattleReport | Recall;
