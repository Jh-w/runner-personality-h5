import PrivacyLink from '../components/PrivacyLink';
import styles from '../styles/pages/PrivacyPage.module.css';

export default function PrivacyPage() {
  return (
    <div className={`page ${styles.page}`}>
      <div className={styles.card}>
        <h1 className={styles.title}>隐私政策</h1>
        <p className={styles.updateDate}>更新日期：2026年6月</p>

        <section className={styles.section}>
          <h2>1. 引言</h2>
          <p>
            「跑步人格测试」（以下简称"本小程序"）是一项基于问卷评估的趣味性格分析工具。
            我们深知个人信息对您的重要性，并承诺以高度负责的态度处理您的信息。
            本隐私政策旨在向您清晰说明我们如何处理您的数据，以及您所享有的权利。
          </p>
        </section>

        <section className={styles.section}>
          <h2>2. 数据收集范围</h2>
          <p>为提供测试服务与进行匿名统计分析，本小程序可能收集以下信息：</p>
          <ul>
            <li><strong>匿名使用统计</strong>：包括但不限于页面访问次数、答题完成率、人格类型分布等汇总统计数据，以上数据均无法追溯到具体个人。</li>
            <li><strong>OpenID 去重标识</strong>：通过微信授权获取您的 OpenID，仅用于区分不同用户、防止同一用户重复计数，我们不会将 OpenID 与您的微信昵称、头像等个人信息进行关联存储。</li>
          </ul>
          <p className={styles.notice}>
            ⚠️ 我们不收集以下信息：姓名、手机号码、身份证号、精确地理位置、健康数据（如心率、步数）、通讯录、相册等任何个人敏感信息。
          </p>
        </section>

        <section className={styles.section}>
          <h2>3. 数据用途</h2>
          <p>我们收集的数据仅用于以下目的：</p>
          <ul>
            <li><strong>产品优化</strong>：分析用户答题行为，优化题目设计和产品体验。</li>
            <li><strong>传播分析</strong>：了解小程序的分享传播路径和用户增长趋势。</li>
            <li><strong>人格分布统计</strong>：汇总各人格类型的占比数据，用于趣味展示（如"已有 X 万人测过"、"XX 类型占比最高"等）。</li>
          </ul>
          <p>以上用途均基于匿名汇总数据，不会对您进行个人画像或定向推送。</p>
        </section>

        <section className={styles.section}>
          <h2>4. 第三方 SDK 说明</h2>
          <p>
            为提升数据分析效率，本小程序可能接入以下第三方服务：
          </p>
          <ul>
            <li><strong>微信公众平台统计</strong>：微信官方提供的基础数据分析服务，受微信隐私保护政策约束。</li>
            <li><strong>神策数据 / GrowingIO（如需接入）</strong>：用于用户行为分析和产品优化。此类 SDK 收集的数据均为匿名化处理，不包含个人身份信息。</li>
          </ul>
          <p>
            如我们将来接入新的第三方服务，将在本政策中更新说明。您可通过小程序内的隐私政策链接查看最新版本。
          </p>
        </section>

        <section className={styles.section}>
          <h2>5. Cookie 与本地存储</h2>
          <p>
            本小程序使用浏览器本地存储（LocalStorage），仅用于保存您的答题进度和测试结果标识，
            以便在页面刷新或意外退出后恢复您的测试状态。我们不会使用 Cookie 或其他技术追踪您在其他网站或应用中的行为。
          </p>
        </section>

        <section className={styles.section}>
          <h2>6. 数据安全</h2>
          <p>
            我们采取合理的技术手段和管理措施保护您的数据安全，包括但不限于数据加密传输（HTTPS）、
            服务器访问权限控制、定期安全检查等。但我们仍需提醒您，互联网环境并非绝对安全，
            我们无法保证数据传输和存储的100%安全性。
          </p>
        </section>

        <section className={styles.section}>
          <h2>7. 您的权利</h2>
          <p>根据相关法律法规，您对您的个人信息享有以下权利：</p>
          <ul>
            <li><strong>知情权</strong>：了解我们如何处理您的数据（即本政策所述内容）。</li>
            <li><strong>查询与咨询</strong>：如您对数据处理有任何疑问，可通过以下渠道联系我们。</li>
            <li><strong>删除权</strong>：您有权要求我们删除与您相关的数据。由于我们仅收集匿名统计数据与去重标识，且不存储个人身份关联信息，您的数据删除请求我们将在合理范围内予以响应。</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>8. 联系与咨询</h2>
          <p>如您对本隐私政策有任何疑问、意见或建议，欢迎通过以下方式联系我们：</p>
          <ul>
            <li>📱 <strong>微信公众号</strong>：关注「跑步人格测试」公众号，通过后台留言联系我们。</li>
            <li>📧 <strong>电子邮箱</strong>：privacy@runner-personality.com</li>
          </ul>
          <p>我们将在收到咨询后的 15 个工作日内予以回复。</p>
        </section>

        <section className={styles.section}>
          <h2>9. 政策更新</h2>
          <p>
            我们可能适时修订本隐私政策。当政策发生重大变更时，我们将通过小程序内显著位置通知您。
            修订后的政策自发布之日起生效。建议您定期查看本页面，以了解最新的隐私保护信息。
          </p>
        </section>

        <p className={styles.footer}>
          感谢您信任并使用跑步人格测试 🏃
        </p>
      </div>

      <PrivacyLink />
    </div>
  );
}
