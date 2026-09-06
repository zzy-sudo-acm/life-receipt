export type Style = 'gentle' | 'snark' | 'absurd';
export type Item = { id: string; raw: string; rule: string; quantity: number; unit: number; customName?: string; variant?: 0 | 1 };
export type Receipt = { id: string; date: string; input: string; style: Style; items: Item[]; example?: boolean };
export const styles: { id: Style; name: string; hint: string }[] = [
  { id: 'gentle', name: '温柔吐槽', hint: '生活有点累，收银员嘴下留情。' },
  { id: 'snark', name: '阴阳怪气', hint: '礼貌在线，言外之意也在线。' },
  { id: 'absurd', name: '荒诞文学', hint: '现实已下班，想象力代收银。' },
];
type Rule = { id: string; re: RegExp; unit: number; names: [string, string, string]; notes: [string, string, string]; count?: RegExp; altNames?: [string, string, string]; needs?: [string, string]; egg?: boolean };
const rule = (id: string, re: RegExp, unit: number, names: Rule['names'], notes: Rule['notes'], count?: RegExp, altNames?: Rule['names']): Rule => ({ id, re, unit, names, notes, count, altNames });
// 联动与彩蛋条目的 re 永不匹配正文，只能由 parseInput 的联动扫描、createReceipt 的彩蛋投掷加入。
const combo = (id: string, needs: [string, string], unit: number, names: Rule['names'], notes: Rule['notes']): Rule => ({ id, re: /(?!)/, unit, names, notes, needs });
const egg = (id: string, unit: number, names: Rule['names'], notes: Rule['notes']): Rule => ({ id, re: /(?!)/, unit, names, notes, egg: true });
export const rules: Rule[] = [
  rule('meeting', /会议|开会|开了.*会/, -10, ['会议耐力体验','人类静音观赏会','灵魂暂存会议室'], ['会散了，把自己也领回来。','会议很充实，尤其是日历。','椅子替灵魂打完了卡。'], /([\d一二两三四五六七八九十]+)\s*(?:场|次|个)(?:[^，。；\n]{0,5})会/, ['会议室久坐纪念','有效内容约等于茶歇','集体发呆同步练习']),
  rule('overtime', /加班|赶工|熬夜工作|通宵|凌晨下班/, -25, ['加班延长套餐','自愿感动公司套装','被工位收养的夜晚'], ['今天的进度条，先停在这里。','公司灯火通明，主要靠你发电。','把月亮从工位上解救出来吧。'], undefined, ['夜晚工位陪伴服务','老板的明天由你垫资','把今天复印了一份']),
  rule('revision', /改稿|需求|返工|改了?方案|修改方案/, -15, ['需求折返跑','最终版之最终版','薛定谔的定稿'], ['改的是方案，不是你的价值。','需求很稳定，稳定地在变。','最终版在平行宇宙里已经通过。']),
  rule('deadline', /截止|ddl|交稿|赶报告|答辩|验收/, -18, ['截止日期追逐赛','时间管理被管理','被日历追捕的一天'], ['赶完这一程，记得喘口气。','截止日期准时，你的心跳也是。','日历长出了腿，追着人跑。']),
  rule('praise', /表扬|夸奖|被夸|升职|涨薪|发工资|中奖|获奖|上岸|被录取|考试通过|面试通过|顺利转正/, 25, ['努力被看见','终于不是画饼','宇宙发来一张奖状'], ['这笔开心，请大方收下。','建议这种流程每天走一遍。','今天的星星盖了个通过章。']),
  rule('interview', /面试|笔试|求职|投简历/, -15, ['勇气展示窗口','灵魂被翻阅时刻','人类试用期体验'], ['敢把自己交出去，就已经很不容易。','流程走到哪算哪，勇气已经到账。','一间会议室称了称你的勇气，分量不轻。']),
  rule('report', /周报|日报|月报|述职|总结汇报/, -12, ['本周存在证明','字数稳定产出','把时间翻译成表格'], ['写完这一篇，这一段才算真的结束。','工作内容很饱满，尤其是描述工作的部分。','表格替你记住了你忙过的证据。']),
  rule('trip', /出差|赶高铁|赶飞机|坐高铁|红眼航班/, -15, ['移动办公修行','行李箱滚轮协奏','把自己寄往另一座城市'], ['奔波的路上，记得也照顾好三餐。','高铁很准点，困意也是。','行李箱里装着半个家和全部的力气。']),
  rule('slack', /摸鱼|划水|带薪如厕/, 8, ['精神微休假','工位上的深呼吸','灵魂短暂离岗'], ['喘口气不算偷懒，人不是机器。','这部分电量由公司友情赞助。','灵魂去茶水间转了一圈，准时回来。']),
  rule('late', /迟到|打卡晚了/, -12, ['晨间意外加速包','全勤奖告别仪式','与时间赛跑预赛'], ['迟到一次不代表什么，别太责怪自己。','打卡机见证了你的冲刺，虽然没算成绩。','今天的早晨比你先到了一步。']),
  rule('work', /上班|工作|打卡|公司|工位|搬砖/, -10, ['今日工位使用费','出席人生例会','工牌牵着人类散步'], ['人已到岗，快乐可以稍后补签。','出勤已完成，灵魂不参与考核。','工牌今天带着你上了一天班。'], undefined, ['今日份出勤打卡','灵魂请了假肉体到岗','人类被椅子租用一天']),
  rule('exam', /考试|考了|模拟卷|刷题|做题|期中|期末/, -18, ['脑力限时挑战','知识库存盘点','脑细胞集体开卷'], ['分数先放一边，辛苦是真的。','题目没少出，脑电没少花。','脑细胞排队交了卷。']),
  rule('study', /学习|复习|背单词|上课|读书|看书|论文|作业|自习|网课|备考|图书馆/, -10, ['知识慢慢进货','脑容量扩建工程','往脑袋里种一座图书馆'], ['学进去一点，也算往前一点。','知识在增加，电量诚实下降。','有些知识在脑袋里安了家。'], undefined, ['一点点变厉害的证据','知识过目不忘，仅限过目','脑细胞的新家具进场']),
  rule('missed', /坐过站|错过.*车|赶不上|误车|没赶上|坐反了|下错站/, -18, ['通勤隐藏关卡','城市额外观光税','被地铁随机传送'], ['多走的路，不必再怪自己。','路线很有弹性，主要是被迫的。','地铁今天把你寄往了支线剧情。']),
  rule('traffic', /堵车|挤地铁|早高峰|通勤|地铁|公交|换乘|末班车/, -15, ['通勤大冒险','人类罐头体验券','城市传送带乘坐费'], ['到站了，肩膀也可以放下来了。','人是流动的，车是静止的。','城市把大家装进了同一节罐头。'], undefined, ['早晚高峰参与奖','免费人体挤压服务','被城市嚼了一遍']),
  rule('rain', /淋雨|下雨|暴雨|忘带伞|下雪|冰雹/, -10, ['天气随机加试','免费淋浴体验','云朵忘了拧紧水龙头'], ['如果淋湿了，先照顾好自己。','天气提供的服务，通常不接受退订。','云朵的水龙头今天漏得有点大。']),
  rule('sunset', /晚霞|日落|夕阳|彩虹|风景|星空|日出|月亮/, 20, ['下班晚霞','免费巨幕观影','天空寄来的橘子糖'], ['晚霞这笔，算你赚的。','这么好看的东西，居然没有付费墙。','天空把最后一颗橘子糖留给了你。'], undefined, ['天边的一点甜','天空今日营业好评','宇宙打翻了橘子汽水']),
  rule('early', /早起|被闹钟叫醒|闹钟一响就起/, 8, ['被窝谈判胜利','清晨首班乘客','和被窝和平分手'], ['能早起的人，值得一顿热乎早饭。','闹钟很尽职，你比它还尽职。','被窝签了停战协议，有效期一天。']),
  rule('coffee', /咖啡|美式|拿铁|浓缩|手冲/, 15, ['续命咖啡','液体开机许可证','借来的一小杯太阳'], ['咖啡到账，慢慢喝，慢慢来。','机器需要电，人类需要美式。','杯子里有一颗小太阳在值班。'], /([\d一二两三四五六七八九十]+)\s*杯/, ['今日份清醒补给','睡眠分期付款','杯装的棕色闹钟']),
  rule('tea', /奶茶|果茶|柠檬茶|珍珠/, 15, ['甜度自选的快乐','情绪补丁加珍珠','杯装快乐星球'], ['小小一杯，也是认真哄自己。','今日情绪支持由珍珠提供。','吸管连接上了另一颗甜味星球。'], /([\d一二两三四五六七八九十]+)\s*杯/, ['一杯小小的奖励','糖度盖过了苦度','珍珠在杯底开圆桌会']),
  rule('nightsnack', /夜宵|宵夜|深夜食堂/, 12, ['深夜热量赦免','胃的夜班补贴','月光下的加餐'], ['夜深了还肯喂饱自己，算一种温柔。','这份热量发生在深夜，按惯例不计入。','月亮看见你吃东西，假装没看见。']),
  rule('snack', /零食|瓜子|薯片|囤了零食/, 8, ['嘴巴陪伴服务','咔嚓咔嚓背景音','手部规律运动'], ['一点点零食，是今天的小括号。','包装袋清空速度符合预期。','咔嚓声是屋子里的白噪音。']),
  rule('badmeal', /难吃|踩雷|饭凉|外卖.*迟|没吃饭|没吃午饭|饭撒了|洒了一身/, -12, ['吃饭计划小故障','味蕾售后申请','午饭去了平行宇宙'], ['下一顿，希望你吃得热乎又满足。','这顿饭的优点是已经结束了。','味蕾正在给宇宙写退款申请。']),
  rule('meal', /吃饭|吃了|午饭|晚饭|早餐|火锅|烧烤|外卖|好吃|大餐|食堂|饺子|面条|麻辣烫|泡面/, 15, ['好好吃饭补给包','肚子先替我满意了','胃里的小型庆典'], ['好好吃过饭，今天就有一件好事。','生活没想明白，菜单先想明白了。','胃里正在举行一场小型庆典。'], undefined, ['今日温饱已签收','恩格尔系数稳定贡献','牙齿搅拌车间出货']),
  rule('cook', /做饭|下厨|烘焙|炒菜|煮汤|烤了|炖了|做了.*饭|一顿饭/, 18, ['人间烟火自制装','厨神短期营业','厨房里的炼金术'], ['这份热乎，是你亲手给自己的。','外卖平台今天少了一单，生活多了点香。','锅铲把普通食材变成了人间。']),
  rule('exercise', /跑步|跑了步|健身|运动|游泳|骑行|瑜伽|打球|散步|走路|晨跑|爬山|徒步|跳操|跳绳|撸铁/, 20, ['身体重启服务','久坐系统更新','把烦恼甩出地球'], ['动一动，给今天换口气。','身体已更新，工位暂不兼容。','有几颗烦恼被汗水带出了轨道。'], undefined, ['今日份热气腾腾','脂肪收到搬迁通知','地心引力对抗演习']),
  rule('friend', /朋友|聚会|聊天|见面|约会|团聚|老同学/, 20, ['人类温暖补给','社交居然有充电款','灵魂短途串门'], ['有人聊几句，日子会松一点。','本次社交竟然不需要会后纪要。','两颗星球交换了一点灯光。']),
  rule('conflict', /吵架|争吵|冷战|被骂|争执|被批评|挨批|闹掰/, -25, ['关系气压波动','情绪沟通附加费','两片云发生了碰撞'], ['先缓一缓，不急着把一切说清楚。','今天的沟通费有点超标。','云碰疼了，也可以先飘远一点。']),
  rule('social', /应酬|社恐|尬聊|社交|团建|饭局|敬酒/, -15, ['社交电量支出','微笑营业服务费','灵魂穿上了社交外套'], ['笑累了，可以安静一会儿。','表情管理今日已超额完成。','回家后，把社交外套挂起来吧。']),
  rule('gift', /随份子|参加婚礼|相亲|喝喜酒/, -10, ['人情往来门票','红色炸弹接待','幸福现场观礼'], ['人情这笔账，花了就花了，别心疼。','红包很体面，余额需要缓一缓。','别人的幸福现场，你随了一份诚意。']),
  rule('redpacket', /抢到红包|收到红包|抢红包|拆红包|红包雨/, 10, ['手气小额兑现','群聊惊喜派送','好运随机掉落'], ['手气不错，今天的小运气到账了。','金额不重要，手速得到了认可。','好运拐了个弯，落在你口袋里。']),
  rule('birthday', /生日|蛋糕许愿/, 25, ['年度限定纪念','宇宙按时送达','又绕太阳一圈'], ['生日快乐，今天的好事请全部签收。','年龄加一，可爱不变，这条不改。','地球又带你绕太阳一圈，辛苦搭乘。']),
  rule('pet', /猫|狗|宠物|毛孩子|撸猫|遛狗|喂猫/, 25, ['毛茸茸充电站','快乐无需绩效','被毛球批准幸福'], ['被毛茸茸接住的瞬间，请好好收藏。','这位情绪顾问只收罐头。','一团毛球签发了今日快乐许可证。']),
  rule('sleepbad', /失眠|熬夜|没睡|睡不着|做噩梦|惊醒|凌晨才睡/, -20, ['夜间清醒加时赛','大脑深夜擅自营业','月亮借走了困意'], ['今晚不必把所有问题都想完。','脑内会议建议改到营业时间。','告诉月亮，困意记得还回来。']),
  rule('emotion', /焦虑|[eE][mM][oO]|内耗|心烦|心慌|委屈|崩溃|压力大/, -15, ['情绪阴天过境','脑内弹幕加更','心事临时加座'], ['心里有点乱没关系，不用马上整理好。','情绪很饱满，尤其是没人看见的部分。','心里下了场小雨，记得给自己撑伞。']),
  rule('crying', /哭了|大哭|流泪|掉眼泪/, -8, ['情绪泄洪服务','眼眶小型降雨','盐份自然排放'], ['哭出来比憋着好，这不算软弱。','眼泪今天限免，流完记得补水。','云朵下雨了，你这边也是，都会停。']),
  rule('rest', /睡觉|午睡|睡了|补觉|睡到|躺平|发呆|休息|放空|懒觉|泡脚|泡澡|冥想|按摩/, 25, ['理直气壮休息券','不产出也能过审','灵魂送去干洗了'], ['什么都不做，也可以是一种照顾。','今日无效忙碌减少，恭喜。','灵魂洗完晒干，明天再穿。'], undefined, ['合法发呆时段','今日KPI：喘气','人类返厂静置中']),
  rule('fun', /电影|追剧|游戏|听歌|音乐|演唱会|看剧|综艺|动漫|漫画|小说|脱口秀|[kK][tT][vV]|[kK]歌|首歌/, 18, ['快乐短暂包场','现实暂时未响应','另一个世界的通行证'], ['开心的时间，不算浪费。','现实已最小化，请勿强制恢复。','你去另一个世界透了一口气。'], /([\d一二两三四五六七八九十]+)\s*(?:部|首)/, ['一段开心的时间','逃避现实限时体验','现实世界请假条']),
  rule('chores', /打扫|洗衣|收拾|家务|整理房间|洗碗|拖地|倒垃圾|换床单/, 10, ['生活秩序回收','灰尘被迫离职','给房间重新排了星座'], ['房间松快一点，你也松快一点。','至少灰尘今天没有躺赢。','散落的日子被你一件件摆好了。']),
  rule('delivery', /快递|包裹|拆箱|买了|购物|取快递|开箱|到货/, 12, ['小小期待签收','快乐已确认收货','来自昨天的礼物'], ['期待被签收，也是一种小确幸。','物流状态更新为：有点开心。','昨天寄来的期待，今天落了地。']),
  rule('haircut', /理发|剪头发|换发型|烫头|染发/, 10, ['头顶焕新工程','形象小版本更新','两厘米的全新开始'], ['换个样子，今天的心情也换个频道。','理发师理解了百分之八十，已属难得。','剪掉的头发留在了店里，烦恼也是。']),
  rule('medical', /医院|体检|看病|挂号|疫苗|拔智齿/, -15, ['身体年度检修','健康对账服务','人体保养到店'], ['愿意去看医生，就是对自己负责。','流程很完善，排队时间尤其完善。','身体递交了一份年度报告，请查收。']),
  rule('unwell', /不舒服|感冒|头疼|头痛|生病|难受|发烧|咳嗽|胃疼|牙疼|过敏/, -20, ['身体申请维护','身体发来暂停通知','身体里的小天气'], ['先照顾身体，其他事可以等一等。','今天适合下线，世界会自己运转。','身体里的天气，值得被温柔等待。']),
  rule('key', /忘带钥匙|被锁在门外|钥匙丢了/, -10, ['家门口罚站体验','门锁忠诚度测试','与家门保持距离'], ['谁都有忘事的时候，别往心里去。','门锁今天格外坚持原则。','门里是你的家，门外的你先别急。']),
  rule('queue', /排队|等位|取号/, -8, ['站立式冥想','队伍尾部分公司','时间静态体验'], ['排过的队，都会变成吃到的饭。','队伍移动速度很稳定，稳定地慢。','你在队伍中学会了与时间相处。']),
  rule('lowbattery', /手机没电|没电关机|借充电宝/, -8, ['数字断联体验','移动设备休眠','被迫下线十分钟'], ['手机休息一会儿，你也可以。','1% 的电量，100% 的心跳。','手机睡着了，世界忽然很安静。']),
  rule('offline', /断网|没网|停电|停水|网断了/, -10, ['现代生活暂停键','回归原始体验','世界短暂离线'], ['断网的空档，正好发发呆。','Wi-Fi 表示需要私人空间。','电停了，蜡烛年代的浪漫限时返场。']),
  rule('moving', /(?<!蚁)搬家|打包行李|找房子/, -20, ['生活空间迁徙','纸箱装载艺术','把生活打包装箱'], ['搬完这一程，新地方会慢慢变熟。','箱子数量永远比预计多一个。','一座城市的角落，即将开始收留你。']),
  combo('combo-caffeine-overtime', ['coffee', 'overtime'], 12, ['咖啡因硬撑协议','拿铁加班延长险','浓缩燃料强制供应'], ['咖啡配加班，今晚请早点把自己还给自己。','公司出梦想，你出咖啡因，两清。','浓缩咖啡已和月亮串通好替你值班。']),
  combo('combo-slack-overtime', ['slack', 'overtime'], 10, ['摸鱼加班对冲','带薪喘气平衡术','鱼与班兼得套餐'], ['摸过的鱼和加的班，勉强打了个平手。','白天省下的电，晚上原样还了回去。','灵魂离岗又返岗，考勤显示全勤。']),
  combo('combo-exercise-meal', ['exercise', 'meal'], 8, ['汗水兑换晚餐','运动加餐联动','热量进出口平衡'], ['流过汗的饭，吃起来格外理直气壮。','消耗与进补同时到账，账本很健康。','鸡腿由汗水全额赞助。']),
  combo('combo-tea-fun', ['tea', 'fun'], 6, ['双倍快乐水','甜度配闲套餐','快乐第二杯半价'], ['甜的上场，闲的作陪，今天不亏。','快乐与糖分达成战略合作。','珍珠和快乐一起沉底，记得吸到。']),
  combo('combo-emotion-rest', ['emotion', 'rest'], 10, ['自我打捞成功','情绪软着陆','阴天转晴记录'], ['心里乱的时候肯休息，是很高级的本事。','内耗被强制下班，由躺平接管。','情绪小雨后，你给自己放了晴。']),
  combo('combo-traffic-fun', ['traffic', 'fun'], 6, ['罐头里的演唱会','通勤娱乐一体化','人挤人也要听歌'], ['车厢再挤，耳机里仍有包厢。','通勤路上开出了隐藏玩法。','沙丁鱼罐头内设有音响系统。']),
  combo('combo-sleepbad-coffee', ['sleepbad', 'coffee'], 8, ['熬夜后的吊瓶','睡眠透支分期','咖啡因紧急补丁'], ['先靠咖啡撑住，今晚请早点睡。','睡眠欠费，咖啡因代为垫付。','月亮借走的困意，咖啡先垫上。']),
  combo('combo-cook-meal', ['cook', 'meal'], 8, ['自给自足的一餐','厨神自产自销','从下锅到光盘'], ['自己做的饭，连洗碗都顺眼一点。','从买菜到光盘，全流程好评。','厨房流水线今日圆满收官。']),
  egg('egg-coin', 5, ['货架缝里的一块钱','地板上的意外之财','一枚硬币的投奔'], ['小小的运气，也是运气。','财富自由进度前进了一块钱。','宇宙找零，请收好。']),
  egg('egg-dog', 8, ['陌生小狗摇尾巴','路边毛球外交官','狗勾的定点投放'], ['小狗不认识你，但小狗喜欢你。','今日好运由尾巴代为签收。','一团热情在街上认出了你。']),
  egg('egg-song', 7, ['随机到本命歌曲','耳机里的刚刚好','日推懂你一次'], ['前奏一响，今天值了。','算法难得懂一次人心。','这首歌今天刚好路过你。']),
  egg('egg-seat', 6, ['上车刚好有座','末班温柔座位','公共交通的偏爱'], ['一个座位，治愈半程疲惫。','全车厢的目光里座位只看向你。','座位提前学会了接人。']),
  egg('egg-cloud', 6, ['形状很离谱的云','天空即兴涂鸦','一朵不被定义的云'], ['抬头的那一秒，算你赚到。','天空今日限定展出，免费入场。','云也是，随便长长就很好看。']),
];
export const examples = [
  { name: '打工人的一天', pool: ['一下午开了三场会','改方案改到怀疑人生','被ddl追了一下午','喝了两杯美式','挤地铁回家','加班到九点半','写完了本周周报','摸鱼刷了半小时手机','看到了下班晚霞','被领导表扬了一句','同事请喝了奶茶','早上差点迟到','下班走路回家','外卖迟到了四十分钟'] },
  { name: '普通但快乐', pool: ['吃了好吃的火锅','和朋友聊了很久','摸了邻居家的猫','去公园跑了步','拆了个期待已久的快递','喝了杯奶茶','自己做了一顿饭','听到了一首好听的歌','给家里打了个电话','买到了一直想吃的点心','晒着太阳看了会儿书','拍到了好看的天空','好好睡了个午觉','帮陌生人指了路'] },
  { name: '今天先躺平', pool: ['睡到自然醒','躺平了一上午','看了一部老电影','发呆了整整十分钟','点了好吃的外卖','打了两局游戏','窝在被子里看剧','睡到中午才起','吃了顿夜宵','窝在沙发上听歌','撸了会儿猫','看了一会儿书','叫了杯奶茶犒劳自己','什么都没干，心安理得'] },
];
export function pickExample(pool: string[], count = 4, rng: () => number = Math.random): string {
  const bag = [...pool];
  for (let i = bag.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [bag[i], bag[j]] = [bag[j], bag[i]]; }
  return bag.slice(0, Math.max(1, Math.min(count, bag.length))).join('；');
}
const cn: Record<string, number> = { 一:1,二:2,两:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9,十:10 };
function numberValue(s: string) { if (/^\d+$/.test(s)) return Number(s); if (cn[s]) return cn[s]; if (s.includes('十')) { const [a,b] = s.split('十'); return (cn[a] || 1) * 10 + (cn[b] || 0); } return 1; }
export function parseInput(input: string): Item[] {
  if (!input.trim() || !input.replace(/[\s，,；;。.!！?？、]/g, '')) throw new Error('先写下一件今天的小事，再来结账吧。');
  if (input.length > 2000) throw new Error('今天的故事有点长，请缩短到 2000 字以内。');
  const parts = input.split(/[\n；;。！!？?]+/).map(s=>s.trim()).filter(Boolean);
  if (parts.length > 30) throw new Error('一张小票最多 30 件事，请分两次结算；没有自动删掉你的内容。');
  const items = parts.map((raw, index): Item => {
    // Conservative fallback for negation and compound facts; retain exact source, no invented outcome.
    const hits = rules.filter(r => r.re.test(raw));
    const negated = /没(?:有)?(?:去|喝|吃|开|跑|看|玩|运动|学习|加班|见|买|下雨|面试|体检|排队|理发)|不想|打算|计划|准备|取消|没有.*(?:会|咖啡|晚霞)/.test(raw);
    const matched = negated || hits.length > 1 && /[，,]|然后|又|并且/.test(raw) ? undefined : hits[0];
    const count = matched?.count?.exec(raw)?.[1];
    const quantity = count ? numberValue(count) : 1;
    if (quantity < 1 || quantity > 99) throw new Error('数量请保持在 1–99 之间；超大数字可以改成文字描述。');
    const item: Item = { id: `item-${index}`, raw, rule: matched?.id || 'unknown', quantity, unit: matched?.unit || 0 };
    if (matched?.altNames) item.variant = Math.random() < 0.5 ? 0 : 1;
    return item;
  });
  const present = new Set(items.map(i => i.rule));
  for (const c of rules) {
    if (!c.needs) continue;
    if (items.length >= 30) break;
    if (c.needs.every(id => present.has(id))) items.push({ id: c.id, raw: '联动彩蛋', rule: c.id, quantity: 1, unit: c.unit });
  }
  return items;
}
const styleIndex = (style: Style) => styles.findIndex(s=>s.id===style);
export function itemName(item: Item, style: Style) {
  const r = rules.find(r=>r.id===item.rule);
  const set = item.variant === 1 && r?.altNames ? r.altNames : r?.names;
  return item.customName || set?.[styleIndex(style)] || item.raw;
}
export function totals(items: Item[]) { const values=items.map(i=>i.quantity*i.unit); const income=values.filter(v=>v>0).reduce((a,b)=>a+b,0); const expense=values.filter(v=>v<0).reduce((a,b)=>a+b,0); return { income, expense, balance:100+income+expense }; }
export function message(receipt: Receipt) {
  const known=receipt.items.map(i=>rules.find(r=>r.id===i.rule)).filter((r): r is Rule=>!!r);
  const unwell=known.find(r=>r.id==='unwell');
  const positive=known.filter(r=>r.unit>0);
  const candidates=unwell ? [unwell] : positive.length ? positive : known;
  if (!candidates.length) return ['这件小事原样收好，今天不必事事都有意义。','这一天没有标准答案，也没必要写汇报。','今天被折成一张纸，交给口袋里的宇宙。'][styleIndex(receipt.style)];
  // 以小票号为种子：同一张票屏幕/PNG/历史一致，换一张票（哪怕同输入）留言换新。
  const seed=[...receipt.id].reduce((a,c)=>a+c.charCodeAt(0),0);
  return candidates[seed % candidates.length].notes[styleIndex(receipt.style)];
}
export function verdict(balance: number) {
  if (balance >= 150) return '电量溢出';
  if (balance >= 110) return '满血续航';
  if (balance >= 80) return '稳定营业';
  if (balance >= 40) return '略有亏空';
  if (balance >= 0) return '电量告急';
  return '透支人生';
}
export function createReceipt(input: string, style: Style, rng: () => number = Math.random): Receipt {
  const items = parseInput(input);
  if (items.length < 30 && rng() < 0.25) {
    const eggs = rules.filter(r => r.egg);
    const pick = eggs[Math.floor(rng() * eggs.length) % eggs.length];
    items.push({ id: pick.id, raw: '今日彩蛋', rule: pick.id, quantity: 1, unit: pick.unit });
  }
  return { id: `LP-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0,6).toUpperCase()}`, date: new Date().toISOString(), input, style, items };
}
const SAMPLE_TEXT = '开了3场会议；喝了1杯咖啡；挤地铁回家；看到了下班晚霞';
export function sampleReceipt(): Receipt { return { ...createReceipt(SAMPLE_TEXT, 'gentle', () => 1), example: true }; }
export const signed=(value: number)=>value>0?`+${value}`:String(value);
export const formatDate=(date:string)=>new Date(date).toLocaleString('zh-CN',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false});
