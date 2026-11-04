# Prompt for OpenCode: install and smoke-test Universal Context Manager

Copy and send the prompt below to OpenCode.

---

عايزك تختبر المهارة الموحّدة `universal-context-manager` داخل OpenCode. مسار النسخة الأصلية:

`C:\Users\mekov\Desktop\skils\get\Universal Context Manager`

نفّذ الاختبار بأمان وبالترتيب التالي:

1. **افحص قبل النسخ.** اقرأ `SKILL.md` و`README.md` و`docs/maintainers/FINAL-RESULTS-2026-11-04.md` من المصدر، وتأكد إن `SKILL.md` يحتوي `name: universal-context-manager`. ممنوع تعديل أي ملف في المصدر أو تثبيته في المسارات العامة للمستخدم.
2. أنشئ مجلد اختبار جديدًا وفريدًا تحت مجلد النظام المؤقت، كمشروع منفصل. انسخ **محتويات** `Universal Context Manager` كاملة إلى `<test-root>/.opencode/skills/universal-context-manager/`، مع الحفاظ على `references/` و`scripts/` و`tests/`. لا تنسخ المجلد الخارجي باسم `Universal Context Manager` داخل مجلد المهارة؛ اسم مجلد المهارة يجب أن يطابق `universal-context-manager`.
3. افحص أن OpenCode يكتشف المهارة من هذا المشروع. استخدم أداة OpenCode الأصلية `skill` لتحميل `universal-context-manager` فعلًا، ثم تأكد من قراءة مدخل المهارة. لا تعتبر مجرد وجود الملفات اختبارًا للاكتشاف أو الاستخدام.
4. شغّل من نسخة الاختبار فقط:
   - `node --check scripts/ucm.mjs`
   - `node --test tests/ucm.test.mjs`
   - `tests/package-check.ps1` باستخدام PowerShell على Windows، أو افحص مكافئًا أن هناك مدخل `SKILL.md` واحدًا وأن روابط وحدات الكتالوج الـ83 موجودة.
   إذا كانت Node.js أو PowerShell غير متاحة، لا تثبّت شيئًا؛ سجّل الاختبار على أنه غير منفذ واذكر السبب.
5. اختبر **توجيه المهام** من خلال المهارة: اطلب منها تحديد الإجراء المناسب لمراجعة تغييرات غير محفوظة في working tree، واطلب منها تحديد ملفات التعليمات التي ستقرأها قبل المراجعة. لا تراجع أي مستودع حقيقي؛ استخدم مشروعًا تجريبيًا صغيرًا داخل `<test-root>` فقط.
6. اختبر **الاستمرارية** على مشروع مؤقت داخل `<test-root>`: أنشئ ملفًا تجريبيًا، نفّذ `ucm init`، احفظ checkpoint تجريبيًا بحالة `in_progress` و`verification.status: not_run`، ثم نفّذ `resume`. غيّر الملف التجريبي وأعد `resume` وتأكد أن التقرير يكتشف التغيير. لا تستخدم بيانات أو أسرارًا حقيقية.
7. لا تثبّت hooks أو plugins، ولا تغيّر إعدادات OpenCode، ولا تستخدم الشبكة أو خدمات خارجية، ولا تعدّل ملفات المشروع الأصلي. اترك مجلد الاختبار ونتائجه للمراجعة، واكتب تقريرًا في `<test-root>/TEST-REPORT.md` يشمل: هل اكتُشفت المهارة وحُمّلت فعليًا، سيناريوهات التوجيه والاستمرارية، أوامر الاختبار ونتائجها، أي اختبار لم يُنفذ وسببه، ومسار مجلد الاختبار.

**لو المهارة غير ظاهرة في جلسة OpenCode الحالية بعد نسخها:** لا تدّعِ أنك استخدمتها. أوقف اختبار الاستخدام بعد فحص النسخ، وقل لي أن أفتح جلسة OpenCode جديدة من `<test-root>`؛ بعدها أكمل الاختبارات في الجلسة الجديدة باستخدام نفس التقرير ومجلد الاختبار.

---

تنبيه: OpenCode يكتشف المهارات من `.opencode/skills/<name>/SKILL.md`، واسم المجلد لازم يطابق `name` في الـfrontmatter؛ المهارة تُحمّل عند الطلب عبر أداة `skill`. راجع [دليل Agent Skills في OpenCode](https://opencode.ai/docs/skills) إذا اختلف سلوك النسخة المثبتة لديك.
