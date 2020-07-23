//@flow
import React, { Component } from 'react';
import I18n from 'i18next';
import { SocialIcon } from 'react-social-icons';

type Props = {
}

type State = {
}

class Footer extends Component<Props,State> {

    constructor(props : Props) {
        super(props);

        this.state = {}
    }


    render() 
    {
        let locale = "?lang="+(this.props.locale==="zh"?"zh-hans":this.props.locale)

        return (
            <footer id="site-footer">
                <div class="head"></div>
                <div class="body">
                    <div id="b1" class="p50">
                        <div id="f1" class="p50"><p>{this.props.locale != "en" ? I18n.t("footer.BDRC"):[I18n.t("home.titleBDRC1"),<br/>,I18n.t("home.titleBDRC2"),<br/>,I18n.t("home.titleBDRC3")]}</p></div>
                        <div id="f2" class="p50">{I18n.t("footer.adr1")}<br/>{I18n.t("footer.adr2")}</div>
                    </div>
                    <div id="b2" class="p50">
                        <div id="f1" class="p35">
                            <span><a href={"https://bdrc.io/contact/"+locale} target="_blank">{I18n.t("footer.contact")}</a></span>
                        </div>
                        <div id="f2" class="p65"><div>
                            <span>{I18n.t("footer.connect")}</span>
                            <div id="s1">
                                <SocialIcon target="_blank" url="https://www.facebook.com/TBRC.org" fgColor="#111312" bgColor="transparent" />
                                <SocialIcon target="_blank" url="https://www.linkedin.com/company/tibetan-buddhist-resource-center/"  fgColor="#111312" bgColor="transparent" />
                                <a href="https://www.instagram.com/buddhist_archive/" target="_blank"><img src="/icons/instagram.svg" style={{ height: "18px"}} /></a>
                            </div>
                        </div></div>
                    </div>
                </div>
                <div class="foot">
                    <div class="p60" id="t1">
                        <div class="p50" id="p1"><img src="/icons/Print-BDRC-icon.svg"/><div>{I18n.t("footer.print")}<a href={"https://bdrc.io/?p=1355"+locale.replace(/[?]/,"&")} target="_blank">{I18n.t("footer.order")}</a></div></div>
                        <div class="p50" id="p2"><img src="/icons/Newsletter-BDRC-icon.svg"/><div>{I18n.t("footer.join")}<a href="https://tbrc.us5.list-manage.com/subscribe?u=a0b3cdd708836773fd5c50233&id=45722d0d96" target="_blank">{I18n.t("footer.subscribe")}</a></div></div>
                    </div>
                    <div class="p40" id="t2">
                        <div class="p65" id="p1"><img src="/icons/donation.svg"/><span>{I18n.t("footer.support")}</span></div>
                        <div class="p35"><a id="donate" href={"https://bdrc.io/donation/"+locale} target="_blank">{I18n.t("topbar.donate")}</a></div>
                    </div>
                </div>
           </footer>  
        )
    }
}

export default Footer