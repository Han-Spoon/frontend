export const LANGUAGE_CODES = ['ko', 'en', 'ar', 'zh-CN', 'ja', 'zh-TW', 'es'] as const;

export type Language = (typeof LANGUAGE_CODES)[number];
export type BaseLanguage = 'ko' | 'en' | 'ar';
export type BackendLanguage = BaseLanguage;
export type NewLanguage = Exclude<Language, BaseLanguage>;

export type LocalizedText = Record<BaseLanguage, string> & Partial<Record<NewLanguage, string>>;

export const LANGUAGE_OPTIONS: Array<{ value: Language; label: string; sub: string }> = [
  { value: 'ko', label: '한국어', sub: 'Korean' },
  { value: 'en', label: 'English', sub: 'English' },
  { value: 'ar', label: 'العربية', sub: 'Arabic' },
  { value: 'zh-CN', label: '简体中文', sub: 'Chinese (Simplified)' },
  { value: 'ja', label: '日本語', sub: 'Japanese' },
  { value: 'zh-TW', label: '繁體中文', sub: 'Chinese (Traditional)' },
  { value: 'es', label: 'Español', sub: 'Spanish' },
];

export const LANGUAGE_LOCALES: Record<Language, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  ar: 'ar',
  'zh-CN': 'zh-CN',
  ja: 'ja-JP',
  'zh-TW': 'zh-TW',
  es: 'es-ES',
};

type ProvisionalTranslation = Record<NewLanguage, string>;

// 사용자가 최종 번역표를 전달하기 전까지 사용하는 1차 번역입니다.
// 한국어 원문을 안정적인 키로 사용해 기존 화면 구조를 바꾸지 않고 7개 언어를 지원합니다.
const PROVISIONAL_TRANSLATIONS: Record<string, ProvisionalTranslation> = {
  '나를 위한 메뉴 가이드': { 'zh-CN': '专属菜单指南', ja: 'あなたのためのメニューガイド', 'zh-TW': '專屬菜單指南', es: 'Tu guía del menú' },
  '메뉴 라이킷': { 'zh-CN': '喜欢这道菜', ja: 'メニューをお気に入りに', 'zh-TW': '喜歡這道菜', es: 'Me gusta este plato' },
  '기록하기': { 'zh-CN': '保存记录', ja: '記録する', 'zh-TW': '儲存紀錄', es: 'Guardar escaneo' },
  '기록 수정': { 'zh-CN': '编辑记录', ja: '記録を編集', 'zh-TW': '編輯紀錄', es: 'Editar registro' },
  '기록 저장하기': { 'zh-CN': '保存到记录', ja: '記録に保存', 'zh-TW': '儲存到紀錄', es: 'Guardar en mi diario' },
  '스캔 기록 보기': { 'zh-CN': '查看扫描记录', ja: 'スキャン履歴を見る', 'zh-TW': '查看掃描紀錄', es: 'Ver mis escaneos' },
  '기록': { 'zh-CN': '记录', ja: '履歴', 'zh-TW': '紀錄', es: 'Diario' },
  '어디서 먹을까요?': { 'zh-CN': '去哪里吃饭？', ja: 'どこで食べましょう？', 'zh-TW': '去哪裡吃飯？', es: '¿Dónde comemos?' },
  '식당 없이 계속하기': { 'zh-CN': '不选餐厅，继续', ja: 'お店を選ばず続ける', 'zh-TW': '不選餐廳，繼續', es: 'Continuar sin restaurante' },
  '어느 식당에 계세요?': { 'zh-CN': '您在哪家餐厅？', ja: 'どのお店にいますか？', 'zh-TW': '您在哪家餐廳？', es: '¿En qué restaurante estás?' },
  '식당 검색': { 'zh-CN': '搜索餐厅', ja: 'お店を検索', 'zh-TW': '搜尋餐廳', es: 'Buscar restaurante' },
  '이 식당 메뉴 스캔': { 'zh-CN': '扫描这家餐厅的菜单', ja: 'このお店のメニューをスキャン', 'zh-TW': '掃描這家餐廳的菜單', es: 'Escanear este menú' },
  '식당 연결하기 · 선택': { 'zh-CN': '关联餐厅 · 可选', ja: 'お店を追加 · 任意', 'zh-TW': '關聯餐廳 · 選填', es: 'Añadir restaurante · opcional' },
  '식당 연결 해제': { 'zh-CN': '取消关联餐厅', ja: 'お店の関連付けを解除', 'zh-TW': '取消關聯餐廳', es: 'Quitar restaurante' },
  '오늘의 스캔 기록하기': { 'zh-CN': '保存今天的扫描', ja: '今日のスキャンを記録', 'zh-TW': '儲存今天的掃描', es: 'Guardar el escaneo de hoy' },
  '오늘의 한 끼를 기록했어요': { 'zh-CN': '已保存今天的用餐记录', ja: '今日の食事を記録しました', 'zh-TW': '已儲存今天的用餐紀錄', es: 'Tu comida, guardada' },
  '식단별': { 'zh-CN': '饮食', ja: '食事別', 'zh-TW': '飲食', es: 'Dieta' },
  '알레르기별': { 'zh-CN': '过敏', ja: 'アレルギー別', 'zh-TW': '過敏', es: 'Alergias' },
  '종교별': { 'zh-CN': '宗教', ja: '宗教別', 'zh-TW': '宗教', es: 'Religión' },
  '같은 식단, 좋은 발견': { 'zh-CN': '相同饮食，精彩发现', ja: '同じ食事の好み、新しい発見', 'zh-TW': '相同飲食，精彩發現', es: 'Necesidades compartidas, grandes hallazgos' },
  '내가 피하는 재료 · 포함 가능성': { 'zh-CN': '我避免的食材 · 含有可能性', ja: '避けている食材 · 含まれる可能性', 'zh-TW': '我避免的食材 · 含有可能性', es: 'Ingredientes que evito · posibilidad de contenerlos' },
  '환율은 매일 00:00 (한국 시간)에 업데이트돼요. 환산 가격은 참고용이에요.': { 'zh-CN': '汇率每日韩国时间00:00更新。换算价格仅供参考。', ja: '為替レートは毎日韓国時間00:00に更新。換算価格は目安です。', 'zh-TW': '匯率每日韓國時間00:00更新。換算價格僅供參考。', es: 'El cambio se actualiza a las 00:00 KST. Los importes son orientativos.' },
  '편했어요': { 'zh-CN': '很方便', ja: '伝えやすかった', 'zh-TW': '很方便', es: 'Fácil' },
  '어려웠어요': { 'zh-CN': '有困难', ja: '伝えにくかった', 'zh-TW': '有困難', es: 'Difícil' },
  '나와 같은 프로필의 경험': { 'zh-CN': '相似饮食需求的体验', ja: '同じ食事条件の人の体験', 'zh-TW': '相似飲食需求的體驗', es: 'Experiencias de personas como tú' },
  'Google ID Token을 받지 못했습니다.': { 'zh-CN': '未能获取 Google ID 令牌。', ja: 'Google IDトークンを取得できませんでした。', 'zh-TW': '無法取得 Google ID 權杖。', es: 'No se pudo obtener el token de ID de Google.' },
  'Google 로그인에 실패했습니다.': { 'zh-CN': 'Google 登录失败。', ja: 'Googleログインに失敗しました。', 'zh-TW': 'Google 登入失敗。', es: 'No se pudo iniciar sesión con Google.' },
  'SCAN COMPLETE': { 'zh-CN': '扫描完成', ja: 'スキャン完了', 'zh-TW': '掃描完成', es: 'ESCANEO COMPLETADO' },
  '스캔 결과': { 'zh-CN': '扫描结果', ja: 'スキャン結果', 'zh-TW': '掃描結果', es: 'Resultados del escaneo' },
  '분석 완료': { 'zh-CN': '分析完成', ja: '分析完了', 'zh-TW': '分析完成', es: 'ANÁLISIS COMPLETADO' },
  '적용된 내 식단 프로필': { 'zh-CN': '已应用的饮食档案', ja: '適用中の食事プロフィール', 'zh-TW': '已套用的飲食檔案', es: 'Perfil alimentario aplicado' },
  '설정된 식단 조건이 없어요': { 'zh-CN': '尚未设置饮食条件', ja: '食事条件は設定されていません', 'zh-TW': '尚未設定飲食條件', es: 'No hay condiciones alimentarias configuradas' },
  '이 결과는 확보된 정보에 따른 안내이며 절대적인 안전을 보장하지 않아요.': { 'zh-CN': '此结果基于现有信息，并不构成绝对安全保证。', ja: 'この結果は確認できた情報に基づく案内で、絶対的な安全を保証するものではありません。', 'zh-TW': '此結果依據現有資訊，並不構成絕對安全保證。', es: 'Esta orientación se basa en la información disponible y no garantiza una seguridad absoluta.' },
  '결과 필터': { 'zh-CN': '结果筛选', ja: '結果フィルター', 'zh-TW': '結果篩選', es: 'Filtros de resultados' },
  '가장 중요한 판정 이유': { 'zh-CN': '主要判断理由', ja: '主な判定理由', 'zh-TW': '主要判斷理由', es: 'Motivo principal' },
  '직원에게 확인하기': { 'zh-CN': '向员工确认', ja: 'スタッフに確認する', 'zh-TW': '向員工確認', es: 'Confirmar con el personal' },
  '판정 근거 보기': { 'zh-CN': '查看判断依据', ja: '判定根拠を見る', 'zh-TW': '查看判斷依據', es: 'Ver los fundamentos' },
  '근거 접기': { 'zh-CN': '收起依据', ja: '根拠を閉じる', 'zh-TW': '收合依據', es: 'Ocultar fundamentos' },
  '잘 모르겠어요': { 'zh-CN': '不太清楚', ja: 'よく分かりません', 'zh-TW': '不太清楚', es: 'No estoy seguro/a' },
  '이번 응답은 향후 재료 가능성 계산을 개선하는 데 활용돼요.': { 'zh-CN': '此回答将用于改进今后的食材可能性估算。', ja: 'この回答は今後の食材可能性の推定改善に活用されます。', 'zh-TW': '此回答將用於改善日後的食材可能性估算。', es: 'Esta respuesta ayudará a mejorar futuras estimaciones sobre los ingredientes.' },
  '메뉴 이름과 설명을 읽고 있어요': { 'zh-CN': '正在读取菜名和说明', ja: 'メニュー名と説明を読み取っています', 'zh-TW': '正在讀取菜名與說明', es: 'Leyendo los nombres y las descripciones' },
  '조리법과 재료 정보를 찾고 있어요': { 'zh-CN': '正在查找做法和食材信息', ja: '調理法と食材情報を探しています', 'zh-TW': '正在查找做法與食材資訊', es: 'Buscando información sobre la preparación y los ingredientes' },
  '육수와 소스 속 숨은 재료도 확인하고 있어요': { 'zh-CN': '正在检查汤底和酱汁中的隐藏食材', ja: 'だしやソースに含まれる隠れた食材も確認しています', 'zh-TW': '正在檢查湯底與醬汁中的隱藏食材', es: 'Comprobando ingredientes ocultos en caldos y salsas' },
  '내 식단 기준과 비교하고 있어요': { 'zh-CN': '正在与我的饮食标准比较', ja: '食事条件と照合しています', 'zh-TW': '正在與我的飲食標準比較', es: 'Comparando con mi perfil alimentario' },
  '분석 과정 자세히 보기': { 'zh-CN': '查看分析过程', ja: '分析の流れを詳しく見る', 'zh-TW': '查看分析過程', es: 'Ver cómo funciona el análisis' },
  '필요한 정보를 차근차근 확인하고 있어요': { 'zh-CN': '正在逐步核对所需信息', ja: '必要な情報を順番に確認しています', 'zh-TW': '正在逐步確認所需資訊', es: 'Estamos comprobando la información paso a paso' },
  '실제 완료 시점은 분석 결과가 준비되면 알려드려요.': { 'zh-CN': '分析结果准备好后，我们会通知你。', ja: '分析結果の準備ができたらお知らせします。', 'zh-TW': '分析結果準備好後，我們會通知你。', es: 'Te avisaremos cuando el resultado esté listo.' },
  '기술을 쉬운 말로 설명해요': { 'zh-CN': '用简单的话说明分析过程', ja: '分析技術をやさしく説明します', 'zh-TW': '用簡單的話說明分析過程', es: 'Así funciona, explicado de forma sencilla' },
  'OCR로 글자를 읽고 메뉴판 문맥을 살핀 뒤, 조리 정보와 검색 근거를 모아 육수·소스의 구성 재료까지 확인해요. 마지막으로 기존 직원 응답 기록과 내 식단 프로필을 비교해 결과를 정리합니다.': { 'zh-CN': '我们先用 OCR 读取文字并理解菜单语境，再结合烹饪资料和搜索依据，检查汤底与酱汁中的组成食材。最后与员工确认记录和你的饮食档案对照，整理结果。', ja: 'OCRで文字を読み、メニューの文脈を確認します。調理情報や検索根拠を集め、だしやソースの構成食材まで調べたうえで、スタッフの確認記録と食事プロフィールを照合して結果をまとめます。', 'zh-TW': '我們先用 OCR 讀取文字並理解菜單脈絡，再結合烹調資料與搜尋依據，確認湯底與醬汁中的組成食材。最後與員工確認紀錄及你的飲食檔案比對，整理結果。', es: 'Primero leemos el texto con OCR y entendemos el contexto del menú. Después reunimos referencias de cocina y búsqueda para revisar incluso los ingredientes de caldos y salsas. Por último, comparamos los registros del personal con tu perfil alimentario.' },
  '현재 백엔드는 세부 단계별 진행 상태를 제공하지 않아 가짜 퍼센트는 표시하지 않아요.': { 'zh-CN': '当前服务器不提供各阶段的实时进度，因此不会显示虚假的百分比。', ja: '現在のバックエンドは各段階の進行状況を提供していないため、推測のパーセントは表示しません。', 'zh-TW': '目前後端未提供各階段的即時進度，因此不會顯示虛假的百分比。', es: 'El servidor todavía no informa del progreso de cada etapa, así que no mostramos porcentajes estimados.' },
  '판정 이유': { 'zh-CN': '判断理由', ja: '判定理由', 'zh-TW': '判斷理由', es: 'Motivo de la decisión' },
  '내 식단 프로필 관련 항목': { 'zh-CN': '与我的饮食档案相关', ja: '食事プロフィールとの関連項目', 'zh-TW': '與我的飲食檔案相關', es: 'Elementos relacionados con mi perfil' },
  '확인되었거나 포함 가능성이 있는 재료': { 'zh-CN': '已确认或可能包含的食材', ja: '確認済み・含まれる可能性のある食材', 'zh-TW': '已確認或可能包含的食材', es: 'Ingredientes confirmados o posibles' },
  '숨은 재료 추론 경로': { 'zh-CN': '隐藏食材的判断路径', ja: '隠れた食材の推定経路', 'zh-TW': '隱藏食材的判斷路徑', es: 'Ruta de ingredientes ocultos' },
  '근거와 출처': { 'zh-CN': '依据与来源', ja: '根拠と情報源', 'zh-TW': '依據與來源', es: 'Evidencias y fuentes' },
  '추가 확인이 필요한 정보': { 'zh-CN': '需要进一步确认的信息', ja: '追加確認が必要な情報', 'zh-TW': '需要進一步確認的資訊', es: 'Información que conviene verificar' },
  '직원 소통 카드': { 'zh-CN': '员工沟通卡', ja: 'スタッフとのコミュニケーションカード', 'zh-TW': '員工溝通卡', es: 'Tarjeta para hablar con el personal' },
  '이 음식 더 알아보기': { 'zh-CN': '进一步了解这道菜', ja: 'この料理をもっと知る', 'zh-TW': '進一步了解這道菜', es: 'Descubre más sobre este plato' },
  '참고 이미지 없음': { 'zh-CN': '暂无参考图片', ja: '参考画像はありません', 'zh-TW': '暫無參考圖片', es: 'Sin imagen de referencia' },
  '근거 수준': { 'zh-CN': '依据等级', ja: '根拠レベル', 'zh-TW': '依據等級', es: 'Nivel de evidencia' },
  '포함 가능성': { 'zh-CN': '包含可能性', ja: '含まれる可能性', 'zh-TW': '包含可能性', es: 'Probabilidad de inclusión' },
  '직원 확인 기록': { 'zh-CN': '员工确认记录', ja: 'スタッフ確認記録', 'zh-TW': '員工確認紀錄', es: 'Registros del personal' },
  '직원에게 재료 확인하기': { 'zh-CN': '向员工确认食材', ja: 'スタッフに食材を確認する', 'zh-TW': '向員工確認食材', es: 'Preguntar al personal por los ingredientes' },
  '표시할 재료 정보가 없어요.': { 'zh-CN': '没有可显示的食材信息。', ja: '表示できる食材情報はありません。', 'zh-TW': '沒有可顯示的食材資訊。', es: 'No hay información de ingredientes disponible.' },
  '세부 판정 이유가 아직 제공되지 않았어요.': { 'zh-CN': '尚未提供详细的判断理由。', ja: '詳しい判定理由はまだ提供されていません。', 'zh-TW': '尚未提供詳細的判斷理由。', es: 'Todavía no hay un motivo detallado disponible.' },
  '판정에 사용된 세부 프로필 항목은 백엔드 연동 후 표시돼요.': { 'zh-CN': '分析接口提供后，将显示使用到的详细档案项目。', ja: '分析APIから提供されると、判定に使われた詳しいプロフィール項目が表示されます。', 'zh-TW': '分析介面提供後，將顯示使用到的詳細檔案項目。', es: 'Los detalles del perfil aparecerán cuando los proporcione la API de análisis.' },
  '현재 API에서 별도의 불확실성 정보는 제공되지 않았어요.': { 'zh-CN': '当前接口未提供单独的不确定性信息。', ja: '現在のAPIからは不確実性に関する個別情報は提供されていません。', 'zh-TW': '目前介面未提供獨立的不確定性資訊。', es: 'La API actual no ha proporcionado detalles separados sobre incertidumbre.' },
  '분석된 메뉴가 없어요': { 'zh-CN': '没有已分析的菜品', ja: '分析済みのメニューはありません', 'zh-TW': '沒有已分析的餐點', es: 'No hay platos analizados' },
  '이 상태의 메뉴가 없어요': { 'zh-CN': '没有符合此状态的菜品', ja: 'この状態に該当するメニューはありません', 'zh-TW': '沒有符合此狀態的餐點', es: 'No hay platos con este estado' },
  '다른 필터를 선택하거나 다시 스캔해 주세요.': { 'zh-CN': '请选择其他筛选条件或重新扫描。', ja: '別のフィルターを選ぶか、もう一度スキャンしてください。', 'zh-TW': '請選擇其他篩選條件或重新掃描。', es: 'Elige otro filtro o vuelve a escanear.' },
  '아직 확인 기록이 충분하지 않아요': { 'zh-CN': '确认记录还不够充分', ja: '確認記録がまだ十分ではありません', 'zh-TW': '確認紀錄還不夠充分', es: 'Aún no hay suficientes registros de confirmación' },
  '재료 정보가 서로 달라 직원 확인이 필요해요': { 'zh-CN': '食材信息存在冲突，需要向员工确认', ja: '食材情報が一致しないため、スタッフへの確認が必要です', 'zh-TW': '食材資訊存在衝突，需要向員工確認', es: 'Las fuentes discrepan; conviene confirmarlo con el personal' },
  '내 식단 전달하기': { 'zh-CN': '向员工说明我的饮食需求', ja: '食事条件をスタッフに伝える', 'zh-TW': '向員工說明我的飲食需求', es: 'Comunicar mis necesidades alimentarias' },
  '가격 확인 필요': { 'zh-CN': '需要确认价格', ja: '価格の確認が必要', 'zh-TW': '需要確認價格', es: 'Precio por confirmar' },
  '재료별 판정 근거': { 'zh-CN': '按食材查看判断依据', ja: '食材別の判定根拠', 'zh-TW': '按食材查看判斷依據', es: 'Evidencias por ingrediente' },
  '출처': { 'zh-CN': '来源', ja: '情報源', 'zh-TW': '來源', es: 'Fuentes' },
  '관련 추천': { 'zh-CN': '相关推荐', ja: '関連するおすすめ', 'zh-TW': '相關推薦', es: 'Recomendación relacionada' },
  '전달할 식단 항목을 선택해 주세요.': { 'zh-CN': '请选择要告知员工的饮食需求。', ja: 'スタッフに伝える食事条件を選んでください。', 'zh-TW': '請選擇要告知員工的飲食需求。', es: 'Elige la necesidad alimentaria que quieres comunicar.' },
  '어떻게 전달할까요?': { 'zh-CN': '想怎么表达？', ja: 'どのように伝えますか？', 'zh-TW': '想怎麼表達？', es: '¿Qué quieres comunicar?' },
  '재료 확인하기': { 'zh-CN': '确认食材', ja: '食材を確認する', 'zh-TW': '確認食材', es: 'Comprobar el ingrediente' },
  '매운지 확인하기': { 'zh-CN': '确认是否辣', ja: '辛いか確認する', 'zh-TW': '確認是否辣', es: 'Preguntar si es picante' },
  '알코올이 들어가는지 확인하기': { 'zh-CN': '确认是否含酒精', ja: 'アルコールが入っているか確認する', 'zh-TW': '確認是否含酒精', es: 'Preguntar si contiene alcohol' },
  '알코올 빼고 요청': { 'zh-CN': '请求不含酒精', ja: 'アルコール抜きでお願いする', 'zh-TW': '請求不含酒精', es: 'Pedirlo sin alcohol' },
  '식단 기준 전달하기': { 'zh-CN': '说明饮食要求', ja: '食事条件を伝える', 'zh-TW': '說明飲食要求', es: 'Comunicar la dieta' },
  '다른 항목 선택': { 'zh-CN': '选择其他项目', ja: '別の項目を選ぶ', 'zh-TW': '選擇其他項目', es: 'Elegir otro elemento' },
  '직원에게 이 화면을 보여주세요.': { 'zh-CN': '请向员工出示此画面。', ja: 'この画面をスタッフに見せてください。', 'zh-TW': '請向員工出示此畫面。', es: 'Muestra esta pantalla al personal.' },
  '가이드라인에 맞춰 촬영해주세요': { 'zh-CN': '请按照拍摄指南重新拍摄。', ja: 'ガイドに沿って撮影してください。', 'zh-TW': '請依照拍攝指南重新拍攝。', es: 'Haz la foto siguiendo la guía.' },
  '같은 식당 내 안전 메뉴': { 'zh-CN': '这家餐厅的其他安心菜单', ja: 'このお店のほかの安心メニュー', 'zh-TW': '這家餐廳的其他安心餐點', es: 'Otros platos adecuados del restaurante' },
  '개인정보와 식단 정보가 안전하게 저장됩니다': { 'zh-CN': '你的个人信息和饮食信息将被安全保存', ja: '個人情報と食事情報は安全に保存されます', 'zh-TW': '你的個人資訊與飲食資訊將安全保存', es: 'Tu información personal y alimentaria se guarda de forma segura' },
  '검색 결과가 없습니다': { 'zh-CN': '没有搜索结果', ja: '検索結果がありません', 'zh-TW': '沒有搜尋結果', es: 'No hay resultados' },
  '검색 결과가 없어요': { 'zh-CN': '没有找到结果', ja: '検索結果がありません', 'zh-TW': '找不到結果', es: 'No se encontraron resultados' },
  '글을 찾을 수 없어요': { 'zh-CN': '找不到这篇文章', ja: '記事が見つかりません', 'zh-TW': '找不到這篇文章', es: 'No se encontró el artículo' },
  '금주': { 'zh-CN': '不饮酒', ja: '禁酒', 'zh-TW': '不飲酒', es: 'Sin alcohol' },
  '기본 메뉴 이미지': { 'zh-CN': '默认菜单图片', ja: 'デフォルトのメニュー画像', 'zh-TW': '預設餐點圖片', es: 'Imagen predeterminada del plato' },
  '나라': { 'zh-CN': '国家或地区', ja: '国・地域', 'zh-TW': '國家或地區', es: 'País o región' },
  '나라 검색': { 'zh-CN': '搜索国家或地区', ja: '国・地域を検索', 'zh-TW': '搜尋國家或地區', es: 'Buscar país o región' },
  '나에게 맞는 한국 음식 찾기': { 'zh-CN': '寻找适合我的韩国美食', ja: '自分に合う韓国料理を見つけよう', 'zh-TW': '尋找適合我的韓國美食', es: 'Encuentra comida coreana para ti' },
  '낯선 메뉴도,\n안심하고 한 스푼.': { 'zh-CN': '陌生的菜单，\n也能安心尝一口。', ja: '知らないメニューも、\n安心してひとさじ。', 'zh-TW': '陌生的菜單，\n也能安心嚐一口。', es: 'Menús desconocidos,\nun bocado con confianza.' },
  '다시 스캔하기': { 'zh-CN': '重新扫描', ja: 'もう一度スキャン', 'zh-TW': '重新掃描', es: 'Escanear de nuevo' },
  '다시 시도': { 'zh-CN': '重试', ja: 'もう一度試す', 'zh-TW': '再試一次', es: 'Reintentar' },
  '다시 촬영': { 'zh-CN': '重新拍摄', ja: '撮り直す', 'zh-TW': '重新拍攝', es: 'Volver a hacer la foto' },
  '다시 촬영이 필요해요': { 'zh-CN': '需要重新拍摄', ja: '撮り直しが必要です', 'zh-TW': '需要重新拍攝', es: 'Hay que volver a hacer la foto' },
  '다음': { 'zh-CN': '下一步', ja: '次へ', 'zh-TW': '下一步', es: 'Siguiente' },
  '닫기': { 'zh-CN': '关闭', ja: '閉じる', 'zh-TW': '關閉', es: 'Cerrar' },
  '뒤로': { 'zh-CN': '返回', ja: '戻る', 'zh-TW': '返回', es: 'Volver' },
  '로그아웃': { 'zh-CN': '退出登录', ja: 'ログアウト', 'zh-TW': '登出', es: 'Cerrar sesión' },
  '로그인 중 오류가 발생했습니다.': { 'zh-CN': '登录时发生错误。', ja: 'ログイン中にエラーが発生しました。', 'zh-TW': '登入時發生錯誤。', es: 'Se produjo un error al iniciar sesión.' },
  '로그인 중...': { 'zh-CN': '正在登录…', ja: 'ログイン中…', 'zh-TW': '正在登入…', es: 'Iniciando sesión…' },
  '마이페이지': { 'zh-CN': '我的页面', ja: 'マイページ', 'zh-TW': '我的頁面', es: 'Mi cuenta' },
  '매운 음식 비선호': { 'zh-CN': '不吃辣', ja: '辛い料理を避ける', 'zh-TW': '不吃辣', es: 'Evitar comida picante' },
  '메뉴 번역과 음식 설명': { 'zh-CN': '菜单翻译与菜品说明', ja: 'メニュー翻訳と料理の説明', 'zh-TW': '菜單翻譯與餐點說明', es: 'Traducción y descripción de platos' },
  '메뉴를 쉽게 이해해요': { 'zh-CN': '轻松读懂菜单', ja: 'メニューがわかりやすい', 'zh-TW': '輕鬆看懂菜單', es: 'Entiende el menú fácilmente' },
  '메뉴를 찾고 있어요': { 'zh-CN': '正在查找菜品', ja: 'メニューを探しています', 'zh-TW': '正在尋找餐點', es: 'Buscando platos' },
  '메뉴판 분석 중': { 'zh-CN': '正在分析菜单', ja: 'メニューを分析中', 'zh-TW': '正在分析菜單', es: 'Analizando el menú' },
  '메뉴판 스캔': { 'zh-CN': '菜单扫描', ja: 'メニュースキャン', 'zh-TW': '菜單掃描', es: 'Escanear menú' },
  '메뉴판 이미지를 읽고 있어요': { 'zh-CN': '正在读取菜单图片', ja: 'メニュー画像を読み取っています', 'zh-TW': '正在讀取菜單圖片', es: 'Leyendo la imagen del menú' },
  '메뉴판 전체가 보이도록 정면에서 찍으면 더 정확해요.': { 'zh-CN': '从正面拍下完整菜单，识别会更准确。', ja: 'メニュー全体が入るよう正面から撮ると、より正確です。', 'zh-TW': '從正面拍下完整菜單，辨識會更準確。', es: 'Para obtener mejores resultados, fotografía el menú completo de frente.' },
  '메뉴판 촬영하기': { 'zh-CN': '拍摄菜单', ja: 'メニューを撮影', 'zh-TW': '拍攝菜單', es: 'Hacer foto del menú' },
  '메뉴판을 찍으면 식이 기준에 맞는 메뉴를 찾고, 필요한 말까지 준비해드려요.': { 'zh-CN': '拍下菜单，我们会帮你找到符合饮食需求的菜品，并准备好需要表达的话。', ja: 'メニューを撮ると、食事条件に合う料理を探し、必要な言葉まで用意します。', 'zh-TW': '拍下菜單，我們會幫你找到符合飲食需求的餐點，並準備好需要表達的話。', es: 'Fotografía el menú y encontraremos platos que se adapten a tu dieta, además de preparar las frases que necesites.' },
  '백엔드에 프로필 API가 없습니다. 백엔드 버전을 확인하세요.': { 'zh-CN': '服务器中没有个人资料 API。请检查后端版本。', ja: 'サーバーにプロフィールAPIがありません。バックエンドのバージョンを確認してください。', 'zh-TW': '伺服器中沒有個人資料 API。請確認後端版本。', es: 'La API de perfil no está disponible en el servidor. Comprueba la versión del backend.' },
  '분석 결과': { 'zh-CN': '分析结果', ja: '分析結果', 'zh-TW': '分析結果', es: 'Resultados' },
  '분석 시작': { 'zh-CN': '开始分析', ja: '分析を開始', 'zh-TW': '開始分析', es: 'Empezar análisis' },
  '분석 중인 메뉴판': { 'zh-CN': '正在分析的菜单', ja: '分析中のメニュー', 'zh-TW': '正在分析的菜單', es: 'Menú en análisis' },
  '분석이 지연되고 있어요. 잠시 후 다시 시도해 주세요.': { 'zh-CN': '分析耗时较长。请稍后重试。', ja: '分析に時間がかかっています。しばらくしてからもう一度お試しください。', 'zh-TW': '分析時間較長，請稍後再試。', es: 'El análisis está tardando más de lo esperado. Inténtalo de nuevo más tarde.' },
  '불러오는 중...': { 'zh-CN': '加载中…', ja: '読み込み中…', 'zh-TW': '載入中…', es: 'Cargando…' },
  '사장님 요청카드': { 'zh-CN': '店员沟通卡', ja: 'お店で見せるカード', 'zh-TW': '店員溝通卡', es: 'Tarjetas para el personal' },
  '사진 파일만 업로드할 수 있어요. JPG, PNG, WEBP 형식만 지원하며 GIF, 영상, 문서는 사용할 수 없습니다.': { 'zh-CN': '只能上传图片。支持 JPG、PNG、WEBP，不支持 GIF、视频或文档。', ja: '画像ファイルのみアップロードできます。JPG、PNG、WEBPに対応し、GIF・動画・文書は使用できません。', 'zh-TW': '只能上傳圖片。支援 JPG、PNG、WEBP，不支援 GIF、影片或文件。', es: 'Solo se admiten imágenes JPG, PNG o WEBP. No se permiten GIF, vídeos ni documentos.' },
  '사진에서 선택하기': { 'zh-CN': '从相册选择', ja: '写真から選ぶ', 'zh-TW': '從相簿選擇', es: 'Elegir de Fotos' },
  '사진을 만들 수 없어요. 사진 선택으로 다시 시도해 주세요.': { 'zh-CN': '无法拍摄照片。请尝试从相册选择。', ja: '写真を撮影できませんでした。写真を選んでお試しください。', 'zh-TW': '無法拍攝照片，請改從相簿選擇。', es: 'No se pudo hacer la foto. Inténtalo eligiendo una imagen.' },
  '삭제': { 'zh-CN': '删除', ja: '削除', 'zh-TW': '刪除', es: 'Eliminar' },
  '삭제에 실패했어요.': { 'zh-CN': '删除失败。', ja: '削除できませんでした。', 'zh-TW': '刪除失敗。', es: 'No se pudo eliminar.' },
  '선택한 메뉴판 미리보기': { 'zh-CN': '所选菜单预览', ja: '選択したメニューのプレビュー', 'zh-TW': '所選菜單預覽', es: 'Vista previa del menú seleccionado' },
  '설정': { 'zh-CN': '设置', ja: '設定', 'zh-TW': '設定', es: 'Ajustes' },
  '설정된 프로필이 없습니다': { 'zh-CN': '尚未设置个人资料', ja: 'プロフィールが設定されていません', 'zh-TW': '尚未設定個人資料', es: 'No hay un perfil configurado' },
  '세션이 만료되었습니다. 다시 로그인해 주세요.': { 'zh-CN': '会话已过期。请重新登录。', ja: 'セッションの有効期限が切れました。もう一度ログインしてください。', 'zh-TW': '工作階段已過期，請重新登入。', es: 'Tu sesión ha caducado. Vuelve a iniciar sesión.' },
  '손글씨 메뉴판은 인식이 어려울 수 있어요': { 'zh-CN': '手写菜单可能难以识别', ja: '手書きのメニューは認識しにくい場合があります', 'zh-TW': '手寫菜單可能較難辨識', es: 'Los menús escritos a mano pueden ser difíciles de reconocer' },
  '수정': { 'zh-CN': '编辑', ja: '編集', 'zh-TW': '編輯', es: 'Editar' },
  '스캔 기록': { 'zh-CN': '扫描记录', ja: 'スキャン履歴', 'zh-TW': '掃描記錄', es: 'Historial' },
  '스캔 기록이 없어요': { 'zh-CN': '还没有扫描记录', ja: 'スキャン履歴はまだありません', 'zh-TW': '尚無掃描記錄', es: 'Aún no hay escaneos' },
  '스캔에 실패했습니다. 다시 시도해 주세요.': { 'zh-CN': '扫描失败。请重试。', ja: 'スキャンに失敗しました。もう一度お試しください。', 'zh-TW': '掃描失敗，請再試一次。', es: 'No se pudo escanear. Inténtalo de nuevo.' },
  '식단': { 'zh-CN': '饮食偏好', ja: '食事条件', 'zh-TW': '飲食偏好', es: 'Dieta' },
  '식단 정보를 확인하고 있어요': { 'zh-CN': '正在检查饮食信息', ja: '食事情報を確認しています', 'zh-TW': '正在確認飲食資訊', es: 'Comprobando tus preferencias alimentarias' },
  '식당에서 바로 보여주는 소통 카드': { 'zh-CN': '可直接给店员看的沟通卡', ja: 'お店ですぐ見せられるコミュニケーションカード', 'zh-TW': '可直接給店員看的溝通卡', es: 'Tarjetas listas para mostrar en el restaurante' },
  '식당에서 자주 쓰는 문장': { 'zh-CN': '餐厅常用语', ja: '飲食店でよく使うフレーズ', 'zh-TW': '餐廳常用語', es: 'Frases útiles en restaurantes' },
  '식이 기준을 꼼꼼히 살펴요': { 'zh-CN': '仔细核对饮食需求', ja: '食事条件を丁寧に確認', 'zh-TW': '仔細確認飲食需求', es: 'Revisa tus necesidades alimentarias' },
  '안전': { 'zh-CN': '安心', ja: '安心', 'zh-TW': '安心', es: 'Adecuado' },
  '알 수 없는 오류가 발생했습니다. 다시 시도해 주세요.': { 'zh-CN': '发生未知错误。请重试。', ja: '不明なエラーが発生しました。もう一度お試しください。', 'zh-TW': '發生未知錯誤，請再試一次。', es: 'Se produjo un error desconocido. Inténtalo de nuevo.' },
  '알레르기·채식·종교 기준 안내': { 'zh-CN': '过敏、素食与宗教饮食提示', ja: 'アレルギー・菜食・宗教上の食事案内', 'zh-TW': '過敏、素食與宗教飲食提示', es: 'Información sobre alergias, dieta y religión' },
  '알레르기와 식단 조건을 비교하고 있어요': { 'zh-CN': '正在核对过敏与饮食条件', ja: 'アレルギーと食事条件を照合しています', 'zh-TW': '正在核對過敏與飲食條件', es: 'Comparando alergias y preferencias alimentarias' },
  '언어': { 'zh-CN': '语言', ja: '言語', 'zh-TW': '語言', es: 'Idioma' },
  '언어 선택': { 'zh-CN': '选择语言', ja: '言語を選択', 'zh-TW': '選擇語言', es: 'Elegir idioma' },
  '없음': { 'zh-CN': '无', ja: 'なし', 'zh-TW': '無', es: 'Ninguno' },
  '오늘의 메뉴를\n안심하고 골라보세요': { 'zh-CN': '安心挑选\n今天想吃的菜单', ja: '今日のメニューを\n安心して選ぼう', 'zh-TW': '安心挑選\n今天想吃的餐點', es: 'Elige el menú de hoy\ncon confianza' },
  '요청 카드': { 'zh-CN': '沟通卡', ja: 'リクエストカード', 'zh-TW': '溝通卡', es: 'Tarjeta de petición' },
  '위험': { 'zh-CN': '不适合', ja: '不適合', 'zh-TW': '不適合', es: 'No adecuado' },
  '음성 듣기': { 'zh-CN': '播放语音', ja: '音声を聞く', 'zh-TW': '播放語音', es: 'Escuchar audio' },
  '음식 알레르기': { 'zh-CN': '食物过敏', ja: '食物アレルギー', 'zh-TW': '食物過敏', es: 'Alergias alimentarias' },
  '이 브라우저에서는 카메라를 바로 열 수 없어요. 사진을 선택해서 분석해 주세요.': { 'zh-CN': '此浏览器无法直接打开相机。请从相册选择菜单图片。', ja: 'このブラウザではカメラを開けません。写真を選んで分析してください。', 'zh-TW': '此瀏覽器無法直接開啟相機，請從相簿選擇菜單圖片。', es: 'Este navegador no puede abrir la cámara. Elige una foto para analizarla.' },
  '이런 글은 어때요?': { 'zh-CN': '也看看这些文章', ja: 'こんな記事はいかがですか？', 'zh-TW': '也看看這些文章', es: 'También te puede gustar' },
  '이름 수정': { 'zh-CN': '重命名', ja: '名前を変更', 'zh-TW': '重新命名', es: 'Cambiar nombre' },
  '이미지 업로드 중': { 'zh-CN': '正在上传图片', ja: '画像をアップロード中', 'zh-TW': '正在上傳圖片', es: 'Subiendo imagen' },
  '이미지 업로드에 실패했어요. 잠시 후 다시 시도해 주세요.': { 'zh-CN': '图片上传失败。请稍后重试。', ja: '画像のアップロードに失敗しました。しばらくしてからもう一度お試しください。', 'zh-TW': '圖片上傳失敗，請稍後再試。', es: 'No se pudo subir la imagen. Inténtalo de nuevo en unos instantes.' },
  '이미지 없음': { 'zh-CN': '没有图片', ja: '画像なし', 'zh-TW': '沒有圖片', es: 'Sin imagen' },
  '이미지 저장 키를 찾을 수 없습니다. 다시 시도해 주세요.': { 'zh-CN': '找不到图片存储信息。请重试。', ja: '画像の保存情報が見つかりません。もう一度お試しください。', 'zh-TW': '找不到圖片儲存資訊，請再試一次。', es: 'Falta la información de almacenamiento de la imagen. Inténtalo de nuevo.' },
  '이전': { 'zh-CN': '返回', ja: '戻る', 'zh-TW': '返回', es: 'Volver' },
  '자세히 보기': { 'zh-CN': '查看详情', ja: '詳しく見る', 'zh-TW': '查看詳情', es: 'Ver más' },
  '저장': { 'zh-CN': '保存', ja: '保存', 'zh-TW': '儲存', es: 'Guardar' },
  '저장 중...': { 'zh-CN': '正在保存…', ja: '保存中…', 'zh-TW': '正在儲存…', es: 'Guardando…' },
  '저장된 카드가 없어요': { 'zh-CN': '还没有保存的卡片', ja: '保存したカードはまだありません', 'zh-TW': '尚無已儲存的卡片', es: 'Aún no hay tarjetas guardadas' },
  '저장에 실패했습니다. 잠시 후 다시 시도해 주세요.': { 'zh-CN': '保存失败。请稍后重试。', ja: '保存に失敗しました。しばらくしてからもう一度お試しください。', 'zh-TW': '儲存失敗，請稍後再試。', es: 'No se pudo guardar. Inténtalo de nuevo.' },
  '저장하고 시작하기': { 'zh-CN': '保存并开始', ja: '保存して始める', 'zh-TW': '儲存並開始', es: 'Guardar y empezar' },
  '전체': { 'zh-CN': '全部', ja: 'すべて', 'zh-TW': '全部', es: 'Todos' },
  '정말 계정을 삭제하시겠습니까? 모든 데이터가 삭제됩니다.': { 'zh-CN': '确定要删除账户吗？所有数据都将被删除。', ja: 'アカウントを削除しますか？すべてのデータが削除されます。', 'zh-TW': '確定要刪除帳戶嗎？所有資料都將被刪除。', es: '¿Quieres eliminar tu cuenta? Se borrarán todos tus datos.' },
  '정말 로그아웃하시겠습니까?': { 'zh-CN': '确定要退出登录吗？', ja: 'ログアウトしますか？', 'zh-TW': '確定要登出嗎？', es: '¿Seguro que quieres cerrar sesión?' },
  '제목으로 검색': { 'zh-CN': '按标题搜索', ja: 'タイトルで検索', 'zh-TW': '依標題搜尋', es: 'Buscar por título' },
  '종교 식단': { 'zh-CN': '宗教饮食', ja: '宗教上の食事', 'zh-TW': '宗教飲食', es: 'Dieta religiosa' },
  '채식·비건': { 'zh-CN': '素食・纯素', ja: 'ベジタリアン・ヴィーガン', 'zh-TW': '素食・純素', es: 'Vegetariano/vegano' },
  '촬영': { 'zh-CN': '扫描', ja: 'スキャン', 'zh-TW': '掃描', es: 'Escanear' },
  '촬영하기': { 'zh-CN': '拍摄', ja: '撮影する', 'zh-TW': '拍攝', es: 'Hacer foto' },
  '최근에 살펴본 메뉴': { 'zh-CN': '最近查看的菜单', ja: '最近見たメニュー', 'zh-TW': '最近查看的菜單', es: 'Menús vistos recientemente' },
  '취소': { 'zh-CN': '取消', ja: 'キャンセル', 'zh-TW': '取消', es: 'Cancelar' },
  '카드': { 'zh-CN': '卡片', ja: 'カード', 'zh-TW': '卡片', es: 'Tarjetas' },
  '카드를 불러오지 못했어요.': { 'zh-CN': '无法加载卡片。', ja: 'カードを読み込めませんでした。', 'zh-TW': '無法載入卡片。', es: 'No se pudieron cargar las tarjetas.' },
  '카메라 권한이 거부되어 촬영할 수 없어요. 브라우저 설정에서 카메라 권한을 허용하거나, 아래에서 메뉴판 사진을 선택해 주세요.': { 'zh-CN': '相机权限被拒绝。请在浏览器设置中允许相机访问，或从下方选择菜单图片。', ja: 'カメラの使用が許可されていません。ブラウザ設定で許可するか、下からメニュー写真を選んでください。', 'zh-TW': '相機權限遭拒。請在瀏覽器設定中允許相機存取，或從下方選擇菜單圖片。', es: 'Se ha denegado el permiso de cámara. Actívalo en el navegador o elige una foto del menú.' },
  '카메라 권한이 없으면 촬영 기능은 사용할 수 없어요. 브라우저 설정에서 카메라를 허용하거나, 메뉴판 사진을 선택해 분석을 계속할 수 있습니다.': { 'zh-CN': '没有相机权限时无法拍摄。你可以在浏览器设置中允许相机访问，或选择菜单图片继续分析。', ja: 'カメラ権限がない場合は撮影できません。ブラウザ設定で許可するか、メニュー写真を選んで分析を続けられます。', 'zh-TW': '沒有相機權限時無法拍攝。你可以在瀏覽器設定中允許相機，或選擇菜單圖片繼續分析。', es: 'Sin permiso de cámara no se puede hacer una foto. Actívalo en el navegador o elige una imagen del menú.' },
  '카메라 여는 중': { 'zh-CN': '正在打开相机', ja: 'カメラを起動中', 'zh-TW': '正在開啟相機', es: 'Abriendo cámara' },
  '카메라 화면을 아직 준비 중이에요. 잠시 후 다시 촬영해 주세요.': { 'zh-CN': '相机仍在准备中。请稍后再拍。', ja: 'カメラを準備中です。少し待ってから撮影してください。', 'zh-TW': '相機仍在準備中，請稍後再拍。', es: 'La cámara aún se está preparando. Inténtalo de nuevo en unos instantes.' },
  '카메라가 바로 열려요': { 'zh-CN': '相机会立即打开', ja: 'カメラがすぐに開きます', 'zh-TW': '相機會立即開啟', es: 'La cámara se abrirá al instante' },
  '큐레이션': { 'zh-CN': '发现', ja: '読みもの', 'zh-TW': '探索', es: 'Descubrir' },
  '프로필': { 'zh-CN': '个人资料', ja: 'プロフィール', 'zh-TW': '個人資料', es: 'Perfil' },
  '프로필 설정': { 'zh-CN': '设置个人资料', ja: 'プロフィール設定', 'zh-TW': '設定個人資料', es: 'Configurar perfil' },
  '프로필 설정 진행률': { 'zh-CN': '个人资料设置进度', ja: 'プロフィール設定の進捗', 'zh-TW': '個人資料設定進度', es: 'Progreso de configuración del perfil' },
  '마이페이지 메뉴': { 'zh-CN': '我的页面分区', ja: 'マイページのメニュー', 'zh-TW': '我的頁面分區', es: 'Secciones de mi página' },
  '프로필 설정하기': { 'zh-CN': '设置个人资料', ja: 'プロフィールを設定', 'zh-TW': '設定個人資料', es: 'Configurar perfil' },
  '프로필 수정': { 'zh-CN': '编辑个人资料', ja: 'プロフィール編集', 'zh-TW': '編輯個人資料', es: 'Editar perfil' },
  '필요한 말을 바로 전해요': { 'zh-CN': '立即表达你的需求', ja: '必要な言葉をすぐ伝える', 'zh-TW': '立即表達你的需求', es: 'Comunica lo que necesitas' },
  '한국 음식 처음': { 'zh-CN': '第一次吃韩国菜', ja: '韓国料理は初めて', 'zh-TW': '第一次吃韓國菜', es: 'Primera vez con comida coreana' },
  '확인 필요': { 'zh-CN': '需要确认', ja: '要確認', 'zh-TW': '需要確認', es: 'Comprobar' },
  '주의': { 'zh-CN': '注意', ja: '注意', 'zh-TW': '注意', es: 'Precaución' },
  '현재 확인된 정보로는 안심하고 선택해도 좋아요': { 'zh-CN': '根据目前确认的信息，可以放心选择。', ja: '現在確認できている情報では、安心して選べます。', 'zh-TW': '依目前確認的資訊，可以放心選擇。', es: 'Según la información disponible, puedes elegir este plato con confianza.' },
  '재료나 조리법을 한 번 더 확인해 주세요': { 'zh-CN': '点餐前，请再确认一次食材或烹饪方式。', ja: '注文前に、食材や調理方法をもう一度確認してください。', 'zh-TW': '點餐前，請再確認一次食材或烹調方式。', es: 'Antes de pedir, comprueba una vez más los ingredientes o la preparación.' },
  '식이 기준과 맞지 않아 피하는 게 좋아요': { 'zh-CN': '这道菜可能不符合你的饮食需求，最好避免。', ja: '食事条件に合わない可能性があるため、避けるのがおすすめです。', 'zh-TW': '這道菜可能不符合你的飲食需求，建議避開。', es: 'Este plato puede no ajustarse a tus necesidades alimentarias, por lo que es mejor evitarlo.' },
  '회원 탈퇴': { 'zh-CN': '删除账户', ja: 'アカウントを削除', 'zh-TW': '刪除帳戶', es: 'Eliminar cuenta' },
  '한스푼': { 'zh-CN': 'Han Spoon', ja: 'Han Spoon', 'zh-TW': 'Han Spoon', es: 'Han Spoon' },
  '함께 찾은 안심 메뉴': { 'zh-CN': '我们还找到这些安心菜品', ja: 'ほかに見つかった安心メニュー', 'zh-TW': '我們還找到這些安心餐點', es: 'Otros platos adecuados que encontramos' },
  '계정 삭제에 실패했습니다.': { 'zh-CN': '账户删除失败。', ja: 'アカウントを削除できませんでした。', 'zh-TW': '帳戶刪除失敗。', es: 'No se pudo eliminar la cuenta.' },
  '사용자': { 'zh-CN': '用户', ja: 'ユーザー', 'zh-TW': '使用者', es: 'Usuario' },
  '개인정보와 식단 정보는 내 프로필에서 관리할 수 있어요': { 'zh-CN': '你可以在个人资料中管理个人与饮食信息', ja: '個人情報と食事情報はプロフィールで管理できます', 'zh-TW': '你可以在個人資料中管理個人與飲食資訊', es: 'Gestiona tu información personal y alimentaria desde tu perfil' },
  '저장에 실패했어요. 다시 시도해 주세요.': { 'zh-CN': '保存失败，请重试。', ja: '保存できませんでした。もう一度お試しください。', 'zh-TW': '儲存失敗，請再試一次。', es: 'No se pudo guardar. Inténtalo de nuevo.' },

  // 식단·알레르기·현장 회화의 임시 번역. 이 그룹은 최종본에서 별도 전문 검수를 거친다.
  '비건': { 'zh-CN': '纯素', ja: 'ヴィーガン', 'zh-TW': '純素', es: 'Vegano' },
  '락토': { 'zh-CN': '乳素', ja: 'ラクト・ベジタリアン', 'zh-TW': '奶素', es: 'Lactovegetariano' },
  '오보': { 'zh-CN': '蛋素', ja: 'オボ・ベジタリアン', 'zh-TW': '蛋素', es: 'Ovovegetariano' },
  '락토오보': { 'zh-CN': '蛋奶素', ja: 'ラクト・オボ・ベジタリアン', 'zh-TW': '蛋奶素', es: 'Ovolactovegetariano' },
  '페스코': { 'zh-CN': '鱼素', ja: 'ペスカタリアン', 'zh-TW': '魚素', es: 'Pescetariano' },
  '할랄': { 'zh-CN': '清真', ja: 'ハラール', 'zh-TW': '清真', es: 'Halal' },
  '코셔': { 'zh-CN': '犹太洁食', ja: 'コーシャ', 'zh-TW': '猶太潔食', es: 'Kosher' },
  '힌두': { 'zh-CN': '印度教饮食', ja: 'ヒンドゥー教の食事', 'zh-TW': '印度教飲食', es: 'Dieta hindú' },
  '계란': { 'zh-CN': '鸡蛋', ja: '卵', 'zh-TW': '雞蛋', es: 'Huevo' },
  '우유': { 'zh-CN': '牛奶', ja: '乳', 'zh-TW': '牛奶', es: 'Leche' },
  '메밀': { 'zh-CN': '荞麦', ja: 'そば', 'zh-TW': '蕎麥', es: 'Trigo sarraceno' },
  '땅콩': { 'zh-CN': '花生', ja: '落花生', 'zh-TW': '花生', es: 'Cacahuete' },
  '대두': { 'zh-CN': '大豆', ja: '大豆', 'zh-TW': '大豆', es: 'Soja' },
  '밀': { 'zh-CN': '小麦', ja: '小麦', 'zh-TW': '小麥', es: 'Trigo' },
  '고등어': { 'zh-CN': '鲭鱼', ja: 'さば', 'zh-TW': '鯖魚', es: 'Caballa' },
  '게': { 'zh-CN': '螃蟹', ja: 'かに', 'zh-TW': '螃蟹', es: 'Cangrejo' },
  '새우': { 'zh-CN': '虾', ja: 'えび', 'zh-TW': '蝦', es: 'Gamba' },
  '돼지고기': { 'zh-CN': '猪肉', ja: '豚肉', 'zh-TW': '豬肉', es: 'Cerdo' },
  '복숭아': { 'zh-CN': '桃子', ja: 'もも', 'zh-TW': '桃子', es: 'Melocotón' },
  '토마토': { 'zh-CN': '番茄', ja: 'トマト', 'zh-TW': '番茄', es: 'Tomate' },
  '아황산류': { 'zh-CN': '亚硫酸盐', ja: '亜硫酸塩', 'zh-TW': '亞硫酸鹽', es: 'Sulfitos' },
  '호두': { 'zh-CN': '核桃', ja: 'くるみ', 'zh-TW': '核桃', es: 'Nuez' },
  '닭고기': { 'zh-CN': '鸡肉', ja: '鶏肉', 'zh-TW': '雞肉', es: 'Pollo' },
  '소고기': { 'zh-CN': '牛肉', ja: '牛肉', 'zh-TW': '牛肉', es: 'Carne de vacuno' },
  '오징어': { 'zh-CN': '鱿鱼', ja: 'いか', 'zh-TW': '魷魚', es: 'Calamar' },
  '조개류': { 'zh-CN': '贝类', ja: '貝類', 'zh-TW': '貝類', es: 'Moluscos' },
  '잣': { 'zh-CN': '松子', ja: '松の実', 'zh-TW': '松子', es: 'Piñón' },
  '알코올': { 'zh-CN': '酒精', ja: 'アルコール', 'zh-TW': '酒精', es: 'Alcohol' },
  '육수': { 'zh-CN': '高汤', ja: 'だし・スープ', 'zh-TW': '高湯', es: 'Caldo' },
  '젓갈': { 'zh-CN': '腌制海鲜', ja: '塩辛', 'zh-TW': '醃製海鮮', es: 'Marisco fermentado y salado' },
  '확인 필요 재료': { 'zh-CN': '需要确认的食材', ja: '確認が必要な食材', 'zh-TW': '需要確認的食材', es: 'Ingrediente por confirmar' },
  '갑각류': { 'zh-CN': '甲壳类', ja: '甲殻類', 'zh-TW': '甲殼類', es: 'Crustáceos' },
  '재료': { 'zh-CN': '食材', ja: '食材', 'zh-TW': '食材', es: 'ingrediente' },
  '특정 재료': { 'zh-CN': '特定食材', ja: '特定の食材', 'zh-TW': '特定食材', es: 'ingrediente específico' },
  '주문': { 'zh-CN': '点餐', ja: '注文', 'zh-TW': '點餐', es: 'Pedido' },
  '재료 확인': { 'zh-CN': '确认食材', ja: '食材を確認', 'zh-TW': '確認食材', es: 'Comprobar ingredientes' },
  '요청': { 'zh-CN': '特别需求', ja: 'リクエスト', 'zh-TW': '特別需求', es: 'Petición' },
  '주문 카드': { 'zh-CN': '点餐卡', ja: '注文カード', 'zh-TW': '點餐卡', es: 'Tarjeta de pedido' },
  '빼고 요청': { 'zh-CN': '请求去除食材', ja: '食材抜きのお願い', 'zh-TW': '請求去除食材', es: 'Pedir sin un ingrediente' },
  '덜맵게 요청': { 'zh-CN': '少辣请求', ja: '辛さ控えめ', 'zh-TW': '少辣請求', es: 'Pedir menos picante' },
  '덜 맵게 요청': { 'zh-CN': '请求少辣', ja: '辛さ控えめでお願いする', 'zh-TW': '請求少辣', es: 'Pedir menos picante' },
  '더맵게 요청': { 'zh-CN': '加辣请求', ja: '辛さを追加', 'zh-TW': '加辣請求', es: 'Pedir más picante' },
  '매운 음식': { 'zh-CN': '辛辣食物', ja: '辛い料理', 'zh-TW': '辛辣食物', es: 'Comida picante' },
  '할랄 주의': { 'zh-CN': '清真饮食注意', ja: 'ハラール要確認', 'zh-TW': '清真飲食注意', es: 'Precaución halal' },
  '코셔 주의': { 'zh-CN': '犹太洁食注意', ja: 'コーシャ要確認', 'zh-TW': '猶太潔食注意', es: 'Precaución kosher' },
  '힌두 주의': { 'zh-CN': '印度教饮食注意', ja: 'ヒンドゥー教の食事要確認', 'zh-TW': '印度教飲食注意', es: 'Precaución dieta hindú' },
  '비건 주의': { 'zh-CN': '纯素饮食注意', ja: 'ヴィーガン要確認', 'zh-TW': '純素飲食注意', es: 'Precaución vegana' },
  '락토 주의': { 'zh-CN': '乳素饮食注意', ja: 'ラクト要確認', 'zh-TW': '奶素飲食注意', es: 'Precaución lactovegetariana' },
  '오보 주의': { 'zh-CN': '蛋素饮食注意', ja: 'オボ要確認', 'zh-TW': '蛋素飲食注意', es: 'Precaución ovovegetariana' },
  '락토 오보 주의': { 'zh-CN': '蛋奶素饮食注意', ja: 'ラクト・オボ要確認', 'zh-TW': '蛋奶素飲食注意', es: 'Precaución ovolactovegetariana' },
  '페스코 주의': { 'zh-CN': '鱼素饮食注意', ja: 'ペスカタリアン要確認', 'zh-TW': '魚素飲食注意', es: 'Precaución pescetariana' },
  '선택된 메뉴': { 'zh-CN': '所选菜品', ja: '選択したメニュー', 'zh-TW': '所選餐點', es: 'Plato seleccionado' },
  '직원 응답': { 'zh-CN': '员工回复', ja: 'スタッフの回答', 'zh-TW': '員工回覆', es: 'Respuesta del personal' },
  '저장되었습니다': { 'zh-CN': '已保存', ja: '保存しました', 'zh-TW': '已儲存', es: 'Guardado' },
  '자주 쓰는 카드로 저장': { 'zh-CN': '保存为常用卡片', ja: 'よく使うカードに保存', 'zh-TW': '儲存為常用卡片', es: 'Guardar como tarjeta frecuente' },
  '네, 주문 받았습니다': { 'zh-CN': '好的，已为您下单', ja: 'はい、ご注文を承りました', 'zh-TW': '好的，已為您下單', es: 'Sí, hemos tomado su pedido' },
  '네, 들어 있어요': { 'zh-CN': '是的，里面有', ja: 'はい、入っています', 'zh-TW': '是的，裡面有', es: 'Sí, lo contiene' },
  '아니요, 안 들어 있어요': { 'zh-CN': '不，里面没有', ja: 'いいえ、入っていません', 'zh-TW': '不，裡面沒有', es: 'No, no lo contiene' },
  '네, 가능해요': { 'zh-CN': '好的，可以', ja: 'はい、できます', 'zh-TW': '好的，可以', es: 'Sí, es posible' },
  '죄송해요, 어려워요': { 'zh-CN': '抱歉，无法满足', ja: '申し訳ありません、難しいです', 'zh-TW': '抱歉，無法滿足', es: 'Lo sentimos, no es posible' },
  '네, 덜 맵게 가능해요': { 'zh-CN': '可以做得少辣', ja: 'はい、辛さを控えめにできます', 'zh-TW': '可以做得少辣', es: 'Sí, se puede preparar menos picante' },
  '네, 더 맵게 가능해요': { 'zh-CN': '可以做得更辣', ja: 'はい、もっと辛くできます', 'zh-TW': '可以做得更辣', es: 'Sí, se puede preparar más picante' },
  '죄송해요, 조절이 어려워요': { 'zh-CN': '抱歉，无法调整辣度', ja: '申し訳ありません、辛さの調整は難しいです', 'zh-TW': '抱歉，無法調整辣度', es: 'Lo sentimos, no se puede ajustar el picante' },
  '숟가락과 젓가락은 어디에 있나요?': { 'zh-CN': '请问勺子和筷子在哪里？', ja: 'スプーンと箸はどこにありますか？', 'zh-TW': '請問湯匙和筷子在哪裡？', es: '¿Dónde están la cuchara y los palillos?' },
  '반찬 리필 가능할까요?': { 'zh-CN': '可以再加一些小菜吗？', ja: 'おかずをおかわりできますか？', 'zh-TW': '可以再加一些小菜嗎？', es: '¿Puedo pedir más guarniciones?' },
  '화장실은 어디에 있나요?': { 'zh-CN': '请问洗手间在哪里？', ja: 'トイレはどこですか？', 'zh-TW': '請問洗手間在哪裡？', es: '¿Dónde está el baño?' },
  '계산하고 싶어요.': { 'zh-CN': '请帮我结账。', ja: 'お会計をお願いします。', 'zh-TW': '請幫我結帳。', es: 'Quisiera pagar, por favor.' },
  '주문하겠습니다.': { 'zh-CN': '我想点餐。', ja: '注文をお願いします。', 'zh-TW': '我想點餐。', es: 'Quisiera pedir.' },

  // 큐레이션 목록에서 먼저 노출되는 제목·요약의 1차 번역.
  '식문화': { 'zh-CN': '饮食文化', ja: '食文化', 'zh-TW': '飲食文化', es: 'Cultura gastronómica' },
  '식당에서': { 'zh-CN': '在餐厅', ja: '食堂で', 'zh-TW': '在餐廳', es: 'En el restaurante' },
  '한식 이야기': { 'zh-CN': '韩国美食故事', ja: '韓国料理の話', 'zh-TW': '韓國美食故事', es: 'Historias de la cocina coreana' },
  '알아두기': { 'zh-CN': '实用贴士', ja: '知っておきたいこと', 'zh-TW': '實用小知識', es: 'Consejos útiles' },
  '한 상 가득, 한국의 밥상': { 'zh-CN': '满满一桌，韩国人的餐桌', ja: '食卓いっぱい、韓国のごはん', 'zh-TW': '滿滿一桌，韓國人的餐桌', es: 'Una mesa llena de Corea' },
  '밥·국·반찬이 어우러지는 정(情)의 한 끼': { 'zh-CN': '米饭、汤和小菜交织出的温暖一餐', ja: 'ご飯・汁物・おかずが調和する温かな一食', 'zh-TW': '白飯、湯與小菜交織出的溫暖一餐', es: 'Arroz, sopa y guarniciones en una comida llena de calidez' },
  '한꺼번에 펼쳐지는 그릇들, 그 안에 담긴 환대의 마음': { 'zh-CN': '同时摆满的碗碟，盛着韩国人的好客之心', ja: '一度に並ぶ器に込められた、おもてなしの心', 'zh-TW': '同時擺滿的碗盤，盛著韓國人的款待之心', es: 'Muchos platos a la vez, llenos de hospitalidad' },
  '발효의 나라': { 'zh-CN': '发酵之国', ja: '発酵の国', 'zh-TW': '發酵之國', es: 'El país de la fermentación' },
  '김치·된장·고추장, 시간이 빚어낸 깊은 맛': { 'zh-CN': '泡菜、大酱、辣椒酱，时间酿出的深厚滋味', ja: 'キムチ・テンジャン・コチュジャン、時間が育てた深い味', 'zh-TW': '泡菜、大醬、辣椒醬，時間釀出的深厚滋味', es: 'Kimchi, doenjang y gochujang: sabores creados por el tiempo' },
  '장독대에서 익어가는 한국의 ‘느린 맛’': { 'zh-CN': '在酱缸台上慢慢成熟的韩国味道', ja: '甕の中で育つ、韓国の「ゆっくりした味」', 'zh-TW': '在醬缸臺上慢慢成熟的韓國味道', es: 'Los sabores lentos de Corea, madurando en tinajas' },
  '오늘 밤은 치맥': { 'zh-CN': '今晚吃炸鸡配啤酒', ja: '今夜はチメク', 'zh-TW': '今晚吃炸雞配啤酒', es: 'Esta noche: chimaek' },
  '바삭한 치킨에 시원한 맥주 한 잔': { 'zh-CN': '酥脆炸鸡配一杯冰爽啤酒', ja: 'カリッとしたチキンに冷たいビール', 'zh-TW': '酥脆炸雞配一杯冰涼啤酒', es: 'Pollo crujiente con una cerveza bien fría' },
  '치킨(chicken)+맥주(maekju)=치맥, 한국인의 밤 문화': { 'zh-CN': '炸鸡加啤酒等于“치맥”，韩国人的夜间文化', ja: 'チキン＋メクチュ＝チメク、韓国の夜の定番', 'zh-TW': '炸雞加啤酒等於「치맥」，韓國人的夜間文化', es: 'Chicken + maekju = chimaek, un ritual nocturno coreano' },
  '길거리 분식의 세계': { 'zh-CN': '韩国街头小吃的世界', ja: '韓国屋台おやつの世界', 'zh-TW': '韓國街頭小吃的世界', es: 'El mundo de la comida callejera coreana' },
  '떡볶이·김밥·순대, 소박하지만 중독적인': { 'zh-CN': '炒年糕、紫菜包饭、韩式血肠，朴素却令人上瘾', ja: 'トッポッキ・キンパ・スンデ、素朴なのにやみつき', 'zh-TW': '辣炒年糕、紫菜飯捲、韓式血腸，樸實卻令人上癮', es: 'Tteokbokki, gimbap y sundae: sencillos pero adictivos' },
  '학교 앞 추억의 맛, 떡볶이 한 접시의 행복': { 'zh-CN': '校门口的回忆，一盘炒年糕的幸福', ja: '学校帰りの思い出、一皿のトッポッキ', 'zh-TW': '校門口的回憶，一盤辣炒年糕的幸福', es: 'El sabor de después de clase en un plato de tteokbokki' },
  '왜 한국 식당의 반찬은 공짜일까?': { 'zh-CN': '为什么韩国餐厅的小菜免费？', ja: '韓国の食堂でおかずが無料なのはなぜ？', 'zh-TW': '為什麼韓國餐廳的小菜免費？', es: '¿Por qué las guarniciones son gratis en Corea?' },
  '김치·나물이 기본으로, 리필까지 — 정(情)의 식문화': { 'zh-CN': '泡菜和拌菜免费续加——充满人情味的饮食文化', ja: 'キムチやナムルはおかわりも無料—情の食文化', 'zh-TW': '泡菜與拌菜免費續加——充滿人情味的飲食文化', es: 'Kimchi y verduras, con reposición: una cultura de hospitalidad' },
  '사장님이 고기를 직접 잘라주는 이유': { 'zh-CN': '为什么店员会亲自帮你剪肉？', ja: '店員さんが肉を切ってくれる理由', 'zh-TW': '為什麼店員會親自幫你剪肉？', es: 'Por qué el personal corta la carne en tu mesa' },
  '테이블 불판 위 바비큐, 그리고 쌈의 즐거움': { 'zh-CN': '桌上烤肉与包菜吃法的乐趣', ja: 'テーブル焼肉とサムの楽しみ', 'zh-TW': '桌上烤肉與包菜吃法的樂趣', es: 'Barbacoa en la mesa y el placer del ssam' },
  '김치는 한 종류가 아니다 — 200가지의 얼굴': { 'zh-CN': '泡菜不只有一种——200种面貌', ja: 'キムチは一種類じゃない—200の顔', 'zh-TW': '泡菜不只一種——200種面貌', es: 'El kimchi no es uno solo: 200 variedades' },
  '배추·무·오이… 지역과 계절이 빚는 수백 가지': { 'zh-CN': '白菜、萝卜、黄瓜……地区与季节造就数百种泡菜', ja: '白菜・大根・きゅうり…地域と季節が生む数百種', 'zh-TW': '白菜、蘿蔔、黃瓜……地區與季節造就數百種泡菜', es: 'Col, rábano, pepino… cientos de variedades según la región y la estación' },
  '찌개 하나를 같이 떠먹는 정(情)': { 'zh-CN': '一起分享一锅汤的温情', ja: '一つのチゲを分け合う温かさ', 'zh-TW': '一起分享一鍋湯的溫情', es: 'Compartir un jjigae, compartir el cariño' },
  '가운데 끓는 뚝배기, 함께 나누는 한 끼': { 'zh-CN': '中央沸腾的砂锅，一起分享的一餐', ja: '真ん中で煮立つ鍋を囲む一食', 'zh-TW': '中央沸騰的砂鍋，一起分享的一餐', es: 'Una olla hirviendo en el centro para compartir' },
  '숙취엔 해장국 — 술 마신 다음 날의 의식': { 'zh-CN': '宿醉时喝醒酒汤——饮酒次日的仪式', ja: '二日酔いにはヘジャングク—翌朝の習慣', 'zh-TW': '宿醉時喝醒酒湯——飲酒隔天的儀式', es: 'Haejangguk: el ritual de la mañana siguiente' },
  '뜨끈한 국물 한 그릇으로 푸는 어제의 피로': { 'zh-CN': '用一碗热汤缓解昨日的疲惫', ja: '熱いスープ一杯で昨日の疲れをほぐす', 'zh-TW': '用一碗熱湯舒緩昨日的疲憊', es: 'Un caldo caliente para aliviar el cansancio de ayer' },
  '젓가락은 납작한 쇠젓가락': { 'zh-CN': '韩国的筷子是扁平金属筷', ja: '韓国の箸は平たい金属製', 'zh-TW': '韓國的筷子是扁平金屬筷', es: 'Los palillos coreanos son planos y metálicos' },
  '밥·국은 숟가락, 반찬은 젓가락 — 식탁의 작은 규칙': { 'zh-CN': '米饭和汤用勺，小菜用筷——餐桌上的小规则', ja: 'ご飯と汁物はスプーン、おかずは箸—食卓の小さなルール', 'zh-TW': '白飯和湯用湯匙，小菜用筷子——餐桌上的小規則', es: 'Cuchara para arroz y sopa, palillos para las guarniciones' },
};

const interpolateDynamicText = (language: Language, ko: string): string | undefined => {
  if (language === 'ko' || language === 'en' || language === 'ar') return undefined;

  const step = ko.match(/^STEP (\d+)$/)?.[1];
  if (step) {
    return ({ 'zh-CN': `第 ${step} 步`, ja: `ステップ ${step}`, 'zh-TW': `第 ${step} 步`, es: `PASO ${step}` } as Record<NewLanguage, string>)[language];
  }

  const count = ko.match(/^총 (\d+)개 메뉴 인식$/)?.[1];
  if (count) {
    return ({ 'zh-CN': `识别出 ${count} 个菜品`, ja: `${count}件のメニューを認識`, 'zh-TW': `辨識出 ${count} 個餐點`, es: `${count} platos detectados` } as Record<NewLanguage, string>)[language];
  }

  const analyzedCount = ko.match(/^메뉴 (\d+)개 분석$/)?.[1];
  if (analyzedCount) {
    return ({ 'zh-CN': `已分析 ${analyzedCount} 个菜品`, ja: `${analyzedCount}件のメニューを分析`, 'zh-TW': `已分析 ${analyzedCount} 個餐點`, es: `${analyzedCount} platos analizados` } as Record<NewLanguage, string>)[language];
  }

  const checkedCount = ko.match(/^메뉴 (\d+)개를 확인했어요$/)?.[1];
  if (checkedCount) {
    return ({ 'zh-CN': `已检查 ${checkedCount} 个菜品`, ja: `${checkedCount}件のメニューを確認しました`, 'zh-TW': `已檢查 ${checkedCount} 個餐點`, es: `Se comprobaron ${checkedCount} platos` } as Record<NewLanguage, string>)[language];
  }

  const slide = ko.match(/^슬라이드 (\d+)$/)?.[1];
  if (slide) {
    return ({ 'zh-CN': `第 ${slide} 张`, ja: `スライド ${slide}`, 'zh-TW': `第 ${slide} 張`, es: `Diapositiva ${slide}` } as Record<NewLanguage, string>)[language];
  }

  const size = ko.match(/^이미지는 (\d+)MB 이하만 업로드할 수 있어요\.$/)?.[1];
  if (size) {
    return ({ 'zh-CN': `图片大小必须为 ${size}MB 以下。`, ja: `画像は${size}MB以下にしてください。`, 'zh-TW': `圖片大小必須為 ${size}MB 以下。`, es: `La imagen debe ocupar ${size} MB o menos.` } as Record<NewLanguage, string>)[language];
  }

  const uploadGuideSize = ko.match(/^JPG, PNG, WEBP 사진만 가능 · 최대 (\d+)MB · GIF\/영상\/문서는 불가$/)?.[1];
  if (uploadGuideSize) {
    return ({
      'zh-CN': `仅支持 JPG、PNG、WEBP · 最大 ${uploadGuideSize}MB · 不支持 GIF、视频或文档`,
      ja: `JPG・PNG・WEBPのみ · 最大${uploadGuideSize}MB · GIF・動画・文書は不可`,
      'zh-TW': `僅支援 JPG、PNG、WEBP · 最大 ${uploadGuideSize}MB · 不支援 GIF、影片或文件`,
      es: `Solo JPG, PNG y WEBP · Máx. ${uploadGuideSize} MB · Sin GIF, vídeos ni documentos`,
    } as Record<NewLanguage, string>)[language];
  }

  return undefined;
};

export function translateText(language: Language, text: LocalizedText): string {
  const direct = text[language];
  if (direct) return direct;

  const dynamic = interpolateDynamicText(language, text.ko);
  if (dynamic) return dynamic;

  if (language !== 'ko' && language !== 'en' && language !== 'ar') {
    return PROVISIONAL_TRANSLATIONS[text.ko]?.[language] ?? text.en;
  }

  return text[language];
}

export const createTranslator = (language: Language) =>
  (ko: string, en: string, ar: string): string => translateText(language, { ko, en, ar });

export const isLanguage = (value: string | null | undefined): value is Language =>
  Boolean(value && LANGUAGE_CODES.includes(value as Language));

export const isBackendLanguage = (value: string | null | undefined): value is BackendLanguage =>
  value === 'ko' || value === 'en' || value === 'ar';

/** 백엔드 언어 enum이 확장되기 전까지 신규 언어는 영어로 저장하고 UI 선택은 로컬에 보존한다. */
export const toBackendLanguage = (language: Language): BackendLanguage =>
  isBackendLanguage(language) ? language : 'en';
