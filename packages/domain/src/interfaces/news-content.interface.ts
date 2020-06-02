import { BattleReport } from '../classes/battle-report';
import { MobNews } from '../classes/mob-news';
import { Recall } from '../classes/recall';

export type INewsContent = MobNews | BattleReport | Recall;
