import React from "react";
import classnames from "classnames/bind";
import Marquee from "@/components/Marquee/Marquee";
import styles from "./page.scss";

const cx = classnames.bind(styles);

/** 广告跑马灯文案 */
const AD_MARQUEE_TEXT =
  "MindBridge-AI 持续迭代中 · 如遇问题请联系管理员 · 感谢使用";

const AppHome: React.FC = () => {

  return (
    <div className={cx("app-home")}>
      <div className={cx("app-header")}>顶部内容</div>
      <div className={cx("app-content")}>内容区域</div>
      <footer className={cx("app-footer")}>
        <Marquee className={cx("app-footer-marquee")} text={AD_MARQUEE_TEXT} />
      </footer>
    </div>
  );
};

export default AppHome;
