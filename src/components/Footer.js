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
                            <span><a href={"https://bdrc.io/contact/?lang="+(this.props.locale==="zh"?"zh-hans":this.props.locale)} target="_blank">{I18n.t("footer.contact")}</a></span>
                        </div>
                        <div id="f2" class="p65"><div style={{"float":"right",paddingRight:"80px"}}>
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
                    <div class="p65">
                        <div class="p50">champ1</div>
                        <div class="p50">champ2</div>
                    </div>
                    <div class="p35">
                        <div class="p65">champ3</div>
                        <div class="p35">champ4</div>
                    </div>
                </div>
           </footer>  
        )
    }
}

export default Footer