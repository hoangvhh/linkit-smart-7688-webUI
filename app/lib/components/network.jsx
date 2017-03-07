import { default as React, PropTypes } from 'react';
import Radium from 'radium';
import mui from 'material-ui';
import AppActions from '../actions/appActions';
import AppDispatcher from '../dispatcher/appDispatcher';
import icon7688 from '../../img/7688.png';
import icon7688Duo from '../../img/7688_duo.png';

const {
  TextField,
  Card,
  FlatButton,
  RadioButtonGroup,
  RadioButton,
  RaisedButton,
  SelectField,
  Dialog,
} = mui;

const ThemeManager = new mui.Styles.ThemeManager();
const Colors = mui.Styles.Colors;
const styles = {

  content: {
    paddingRight: '128px',
    paddingLeft: '128px',
    '@media (max-width: 760px)': {
      paddingRight: '20px',
      paddingLeft: '20px',
    },
  },

};


@Radium
export default class networkComponent extends React.Component {
  static propTypes = {
    errorMsg: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    successMsg: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    boardInfo: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  }
  constructor(props) {
    super(props);

    this.state = {
      modal: true,
      errorMsgTitle: null,
      errorMsg: null,
    };

    this.state.wifiList = [{
      payload: 0,
      text: __('Choose the Wi-Fi network.'),
    }];

    if (this.props.boardInfo.wifi.ap.encryption === 'none') {
      this.state.apContent = {
        ssid: this.props.boardInfo.wifi.ap.ssid || '',
        key: '',
        encryption: false,
		wanProto: this.props.boardInfo.network.wan.proto,
        wanIpaddr: this.props.boardInfo.network.wan.ipaddr,
        wanNetmask: this.props.boardInfo.network.wan.netmask,
        wanGateway: this.props.boardInfo.network.wan.gateway,
        wanDns: this.props.boardInfo.network.wan.dns,
        wan_orig_ifname: 'apcli0',
        wan_orig_bridge: 'false',
        wanIfname: 'apcli0',
      };
    } else {
      this.state.apContent = {
        ssid: this.props.boardInfo.wifi.ap.ssid || '',
        key: this.props.boardInfo.wifi.ap.key || '',
        encryption: true,
		wanProto: this.props.boardInfo.network.wan.proto,
        wanIpaddr: this.props.boardInfo.network.wan.ipaddr,
        wanNetmask: this.props.boardInfo.network.wan.netmask,
        wanGateway: this.props.boardInfo.network.wan.gateway,
        wanDns: this.props.boardInfo.network.wan.dns,
        wan_orig_ifname: 'apcli0',
        wan_orig_bridge: 'false',
        wanIfname: 'apcli0',
      };
    }

    this.state.showPassword = false;
    this.state.showRepeaterPassword = false;
    this.state.notPassPassword = false;
    this.state.notPassRepeaterPassword = false;
    this.state.selectValue = 0;
    this.state.staContent = {
      	ssid: this.props.boardInfo.wifi.sta.ssid || '',
      	key: this.props.boardInfo.wifi.sta.key || '',
      	encryption: this.props.boardInfo.wifi.sta.encryption.enabled || false,
		wanProto: this.props.boardInfo.network.wan.proto,
        wanIpaddr: this.props.boardInfo.network.wan.ipaddr,
        wanNetmask: this.props.boardInfo.network.wan.netmask,
        wanGateway: this.props.boardInfo.network.wan.gateway,
        wanDns: this.props.boardInfo.network.wan.dns,
        wan_orig_ifname: 'apcli0',
        wan_orig_bridge: 'false',
        wanIfname: 'apcli0',
    };

    this.state.apstaContent = {
      ssid: this.props.boardInfo.wifi.sta.ssid || '',
      key: this.props.boardInfo.wifi.sta.key || '',
      encryption: this.props.boardInfo.wifi.sta.encryption.enabled || false,
      repeaterSsid: this.props.boardInfo.wifi.ap.ssid || '',
      repeaterKey: this.props.boardInfo.wifi.ap.key || '',
    };

    this.state.mode = this.props.boardInfo.wifi.radio0.linkit_mode;

    switch (this.state.mode) {
    case 'ap':
      if (this.state.apContent.key.length > 0 && this.state.apContent.key.length < 8 ) {
        this.state.notPassPassword = true;
      }
      break;
    case 'sta':
      break;
    case 'apsta':
      if (this.state.apstaContent.key.length > 0 && this.state.apstaContent.key.length < 8 ) {
        this.state.notPassPassword = true;
      }
      if (this.state.apstaContent.repeaterKey.length > 0 && this.state.apstaContent.repeaterKey.length < 8 ) {
        this.state.notPassRepeaterPassword = true;
      }
      break;
    default:
      break;
    }

    this._scanWifi = ::this._scanWifi;
    this._onRadioButtonClick = ::this._onRadioButtonClick;
    this._handleSelectValueChange = ::this._handleSelectValueChange;
    this._handleSettingMode = ::this._handleSettingMode;
    this.selectWifiList = false;
    this._returnToIndex = ::this._returnToIndex;
    this._cancelErrorMsgDialog = ::this._cancelErrorMsgDialog;
    this._cancelBoardMsgDialog = ::this._cancelBoardMsgDialog;
  }

  componentWillMount() {
    const this$ = this;

    ThemeManager.setComponentThemes({
      textField: {
        focusColor: Colors.amber700,
      },
      menuItem: {
        selectedTextColor: Colors.amber700,
      },
      radioButton: {
        backgroundColor: '#00a1de',
        checkedColor: '#00a1de',
      },
    });
    AppActions.loadModel(window.session)
    .then((data) => {
      return this$.setState({ boardModel: data.body.result[1].model });
    });
  }

  componentDidMount() {
    return this._scanWifi();
  }

  getChildContext() {
    return {
      muiTheme: ThemeManager.getCurrentTheme(),
    };
  }

  render() {
    let textType = 'password';
    let repeaterTextType = 'password';
    let errorText;
    let showPasswordStyle = {
      width: '100%',
      marginBottom: '44px',
    };
    let elemWIFI;
    let elemNET;
    let elemNET2;
    let elemNET3;
    let staPassword;

    if (this.state.showPassword) {
      textType = 'text';
    }
    if (this.state.showRepeaterPassword) {
      repeaterTextType = 'text';
    }
    if (this.state.notPassPassword || this.state.notPassRepeaterPassword) {
      errorText = (
        <div>
          <p style={{
            color: '#69BE28',
            textAlign: 'left',
            marginTop: '2px',
          }}>{ __('Please use at least 8 alphanumeric characters.') }</p>
        </div>
      );
      showPasswordStyle = {
        marginTop: '20px',
        width: '100%',
        marginBottom: '44px',
      };
    }

    const boardMsgActions = [
      <FlatButton
        label={ __('OK') }
        labelStyle={{ color: Colors.amber700 }}
        onTouchTap={ this._cancelBoardMsgDialog }
        hoverColor="none" />,
    ];

    const errMsgActions = [
      <FlatButton
        label={__('SIGN IN')}
        labelStyle={{ color: Colors.amber700 }}
        onTouchTap={ this._cancelErrorMsgDialog }
        hoverColor="none" />,
    ];

    if(this.state.mode === 'ap') {
	   	elemNET = (
        <div>
          <TextField
          hintText={__('Choose static or dhcp')}
          type="text"
          value={ this.state.apContent.wanProto }
          style={{ width: '100%' }}
          onChange={
            (e) => {
              this.setState({
                apContent: {
                	wanProto: e.target.value,
                	ssid: this.state.apContent.ssid,
			      	key: this.state.apContent.key,
			      	encryption: this.state.apContent.encryption,
			        wanIpaddr: this.state.apContent.wanIpaddr,
			        wanNetmask: this.state.apContent.wanNetmask,
			        wanGateway: this.state.apContent.wanGateway,
			        wanDns: this.state.apContent.wanDns,
			        wan_orig_ifname: this.state.apContent.wan_orig_ifname,
			        wan_orig_bridge: this.state.apContent.wan_orig_bridge,
			        wanIfname: this.state.apContent.wanIfname,
                },
              });
            }
          }
          underlineFocusStyle={{ borderColor: Colors.amber700 }}
          floatingLabelStyle={{ color: 'rgba(0, 0, 0, 0.498039)' }}
          floatingLabelText={
            <div>
              { __('IP mode') } <b style={{ color: 'red' }}>*</b>
            </div>
          } />
        </div>
    	);
    } else if(this.state.mode === 'sta') {
	   	elemNET = (
        <div>
          <TextField
          hintText={__('Choose static or dhcp')}
          type="text"
          value={ this.state.staContent.wanProto }
          style={{ width: '100%' }}
          onChange={
            (e) => {
              this.setState({
                staContent: {
                	wanProto: e.target.value,
                	ssid: this.state.staContent.ssid,
			      	key: this.state.staContent.key,
			      	encryption: this.state.staContent.encryption,
			        wanIpaddr: this.state.staContent.wanIpaddr,
			        wanNetmask: this.state.staContent.wanNetmask,
			        wanGateway: this.state.staContent.wanGateway,
			        wanDns: this.state.staContent.wanDns,
			        wan_orig_ifname: this.state.staContent.wan_orig_ifname,
			        wan_orig_bridge: this.state.staContent.wan_orig_bridge,
			        wanIfname: this.state.staContent.wanIfname,
                },
              });
            }
          }
          underlineFocusStyle={{ borderColor: Colors.amber700 }}
          floatingLabelStyle={{ color: 'rgba(0, 0, 0, 0.498039)' }}
          floatingLabelText={
            <div>
              { __('IP mode') } <b style={{ color: 'red' }}>*</b>
            </div>
          } />
        </div>
    	);
    }

    if(this.state.apContent.wanProto == 'static') {
		elemNET2 = (
	    <div>
          <TextField
          hintText={__('Input IP, ex: 192.168.x.xxx')}
          type="text"
          value={ this.state.apContent.wanIpaddr }
          style={{ width: '100%' }}
          onChange={
            (e) => {
              this.setState({
                apContent: {
                	wanIpaddr: e.target.value,
                	ssid: this.state.apContent.ssid,
			      	key: this.state.apContent.key,
			      	encryption: this.state.apContent.encryption,
			        wanProto: this.state.apContent.wanProto,
			        wanNetmask: this.state.apContent.wanNetmask,
			        wanGateway: this.state.apContent.wanGateway,
			        wanDns: this.state.apContent.wanDns,
			        wan_orig_ifname: this.state.apContent.wan_orig_ifname,
			        wan_orig_bridge: this.state.apContent.wan_orig_bridge,
			        wanIfname: this.state.apContent.wanIfname,
	             },
              });
            }
          }
          underlineFocusStyle={{ borderColor: Colors.amber700 }}
          floatingLabelStyle={{ color: 'rgba(0, 0, 0, 0.498039)' }}
          floatingLabelText={
            <div>
              { __('IP address') } <b style={{ color: 'red' }}>*</b>
            </div>
          } />
	    </div>
    	);
    }
    if(this.state.staContent.wanProto == 'static') {
    	elemNET2 = (
	    <div>
          <TextField
          hintText={__('Input IP, ex: 192.168.x.xxx')}
          type="text"
          value={ this.state.staContent.wanIpaddr }
          style={{ width: '100%' }}
          onChange={
            (e) => {
              this.setState({
                staContent: {
                	wanIpaddr: e.target.value,
                	ssid: this.state.staContent.ssid,
			      	key: this.state.staContent.key,
			      	encryption: this.state.staContent.encryption,
			        wanProto: this.state.staContent.wanProto,
			        wanNetmask: this.state.staContent.wanNetmask,
			        wanGateway: this.state.staContent.wanGateway,
			        wanDns: this.state.staContent.wanDns,
			        wan_orig_ifname: this.state.staContent.wan_orig_ifname,
			        wan_orig_bridge: this.state.staContent.wan_orig_bridge,
			        wanIfname: this.state.staContent.wanIfname,
                },
              });
            }
          }
          underlineFocusStyle={{ borderColor: Colors.amber700 }}
          floatingLabelStyle={{ color: 'rgba(0, 0, 0, 0.498039)' }}
          floatingLabelText={
            <div>
              { __('IP address') } <b style={{ color: 'red' }}>*</b>
            </div>
          } />
	    </div>
    	);
    }

	if(this.state.mode === 'sta' && (this.state.staContent.wanProto == 'static' || this.state.staContent.wanProto == 'dhcp')) {
		elemNET3 = (
	    <div>
          <TextField
          hintText={__('Input netmask, ex: 255.255.255.0')}
          type="text"
          value={ this.state.staContent.wanNetmask }
          style={{ width: '100%' }}
          onChange={
            (e) => {
              this.setState({
                staContent: {
                	wanNetmask: e.target.value,
                	ssid: this.state.staContent.ssid,
			      	key: this.state.staContent.key,
			      	encryption: this.state.staContent.encryption,
			        wanProto: this.state.staContent.wanProto,
			        wanIpaddr: this.state.staContent.wanIpaddr,
			        wanGateway: this.state.staContent.wanGateway,
			        wanDns: this.state.staContent.wanDns,
			        wan_orig_ifname: this.state.staContent.wan_orig_ifname,
			        wan_orig_bridge: this.state.staContent.wan_orig_bridge,
			        wanIfname: this.state.staContent.wanIfname,
                },
              });
            }
          }
          underlineFocusStyle={{ borderColor: Colors.amber700 }}
          floatingLabelStyle={{ color: 'rgba(0, 0, 0, 0.498039)' }}
          floatingLabelText={
            <div>
              { __('Netmask') } <b style={{ color: 'red' }}>*</b>
            </div>
          } />
          <TextField
          hintText={__('Input gateway, ex: 192.168.x.1')}
          type="text"
          value={ this.state.staContent.wanGateway}
          style={{ width: '100%' }}
          onChange={
            (e) => {
              this.setState({
                staContent: {
                	wanGateway: e.target.value,
                	ssid: this.state.staContent.ssid,
			      	key: this.state.staContent.key,
			      	encryption: this.state.staContent.encryption,
			        wanProto: this.state.staContent.wanProto,
			        wanIpaddr: this.state.staContent.wanIpaddr,
			        wanNetmask: this.state.staContent.wanNetmask,
			        wanDns: this.state.staContent.wanDns,
			        wan_orig_ifname: this.state.staContent.wan_orig_ifname,
			        wan_orig_bridge: this.state.staContent.wan_orig_bridge,
			        wanIfname: this.state.staContent.wanIfname,
                },
              });
            }
          }
          underlineFocusStyle={{ borderColor: Colors.amber700 }}
          floatingLabelStyle={{ color: 'rgba(0, 0, 0, 0.498039)' }}
          floatingLabelText={
            <div>
              { __('Gateway') } <b style={{ color: 'red' }}>*</b>
            </div>
          } />
          <TextField
          hintText={__('Input DNS, ex: 8.8.8.8')}
          type="text"
          value={ this.state.staContent.wanDns }
          style={{ width: '100%' }}
          onChange={
            (e) => {
              this.setState({
                staContent: {
                	wanDns: e.target.value,
                	ssid: this.state.staContent.ssid,
			      	key: this.state.staContent.key,
			      	encryption: this.state.staContent.encryption,
			        wanProto: this.state.staContent.wanProto,
			        wanIpaddr: this.state.staContent.wanIpaddr,
			        wanGateway: this.state.staContent.wanGateway,
			        wanNetmask: this.state.staContent.wanNetmask,
			        wan_orig_ifname: this.state.staContent.wan_orig_ifname,
			        wan_orig_bridge: this.state.staContent.wan_orig_bridge,
			        wanIfname: this.state.staContent.wanIfname,
                },
              });
            }
          }
          underlineFocusStyle={{ borderColor: Colors.amber700 }}
          floatingLabelStyle={{ color: 'rgba(0, 0, 0, 0.498039)' }}
          floatingLabelText={
            <div>
              { __('DNS server') } <b style={{ color: 'red' }}>*</b>
            </div>
          } />         
	    </div>
    	);
	}

	if(this.state.mode === 'ap' && (this.state.apContent.wanProto == 'static' || this.state.apContent.wanProto == 'dhcp')) {
    	elemNET3 = (
      	<div>
          <TextField
          hintText={__('Input netmask, ex: 255.255.255.0')}
          type="text"
          value={ this.state.apContent.wanNetmask }
          style={{ width: '100%' }}
          onChange={
            (e) => {
              this.setState({
                apContent: {
                	wanNetmask: e.target.value,
                	ssid: this.state.apContent.ssid,
			      	key: this.state.apContent.key,
			      	encryption: this.state.apContent.encryption,
			        wanProto: this.state.apContent.wanProto,
			        wanIpaddr: this.state.apContent.wanIpaddr,
			        wanGateway: this.state.apContent.wanGateway,
			        wanDns: this.state.apContent.wanDns,
			        wan_orig_ifname: this.state.apContent.wan_orig_ifname,
			        wan_orig_bridge: this.state.apContent.wan_orig_bridge,
			        wanIfname: this.state.apContent.wanIfname,
                },
              });
            }
          }
          underlineFocusStyle={{ borderColor: Colors.amber700 }}
          floatingLabelStyle={{ color: 'rgba(0, 0, 0, 0.498039)' }}
          floatingLabelText={
            <div>
              { __('Netmask') } <b style={{ color: 'red' }}>*</b>
            </div>
          } />
          <TextField
          hintText={__('Input gateway, ex: 192.168.x.1')}
          type="text"
          value={ this.state.apContent.wanGateway}
          style={{ width: '100%' }}
          onChange={
            (e) => {
              this.setState({
                apContent: {
                  wanGateway: e.target.value,
                  ssid: this.state.apContent.ssid,
	              key: this.state.apContent.key,
	              encryption: this.state.apContent.encryption,
	              wanProto: this.state.apContent.wanProto,
	              wanIpaddr: this.state.apContent.wanIpaddr,
	              wanNetmask: this.state.apContent.wanNetmask,
	              wanDns: this.state.apContent.wanDns,
	              wan_orig_ifname: this.state.apContent.wan_orig_ifname,
	              wan_orig_bridge: this.state.apContent.wan_orig_bridge,
	              wanIfname: this.state.apContent.wanIfname,
                },
              });
            }
          }
          underlineFocusStyle={{ borderColor: Colors.amber700 }}
          floatingLabelStyle={{ color: 'rgba(0, 0, 0, 0.498039)' }}
          floatingLabelText={
            <div>
              { __('Gateway') } <b style={{ color: 'red' }}>*</b>
            </div>
          } />
          <TextField
          hintText={__('Input DNS, ex: 8.8.8.8')}
          type="text"
          value={ this.state.apContent.wanDns }
          style={{ width: '100%' }}
          onChange={
            (e) => {
              this.setState({
	                apContent: {
	                wanDns: e.target.value,
	                ssid: this.state.apContent.ssid,
	                key: this.state.apContent.key,
		            encryption: this.state.apContent.encryption,
		            wanProto: this.state.apContent.wanProto,
		            wanIpaddr: this.state.apContent.wanIpaddr,
		            wanGateway: this.state.apContent.wanGateway,
		            wanNetmask: this.state.apContent.wanNetmask,
		            wan_orig_ifname: this.state.apContent.wan_orig_ifname,
		            wan_orig_bridge: this.state.apContent.wan_orig_bridge,
		            wanIfname: this.state.apContent.wanIfname,
                },
              });
            }
          }
          underlineFocusStyle={{ borderColor: Colors.amber700 }}
          floatingLabelStyle={{ color: 'rgba(0, 0, 0, 0.498039)' }}
          floatingLabelText={
            <div>
              { __('DNS server') } <b style={{ color: 'red' }}>*</b>
            </div>
          } />         
  		</div>
  	  );
	}

    if (this.state.mode === 'sta') {
      if (this.state.staContent.encryption) {
        staPassword = (
          <div>
            <TextField
              style={{ width: '100%' }}
              value={ this.state.staContent.key }
              hintText={__('Please enter your password')}
              floatingLabelStyle={{ color: 'rgba(0, 0, 0, 0.498039)' }}
              underlineFocusStyle={{ borderColor: Colors.amber700 }}
              type={ textType }
              onChange={
                (e) => {
                  this.setState({
                    staContent: {
                      	ssid: this.state.staContent.ssid,
                      	key: e.target.value,
                      	encryption: true,
                      	wanIpaddr: this.state.staContent.wanIpaddr,
				        wanProto: this.state.staContent.wanProto,
				        wanNetmask: this.state.staContent.wanNetmask,
				        wanGateway: this.state.staContent.wanGateway,
				        wanDns: this.state.staContent.wanDns,
				        wan_orig_ifname: this.state.staContent.wan_orig_ifname,
				        wan_orig_bridge: this.state.staContent.wan_orig_bridge,
				        wanIfname: this.state.staContent.wanIfname,
                    },
                  });
                }
              }
              floatingLabelText={__('Password')} />
            <a
              onTouchTap={
                () => {
                  this.setState({
                    showPassword: !this.state.showPassword,
                  });
                }
              }
              style={{
                textAlign: 'left',
                color: Colors.amber700,
                textDecoration: 'none',
                cursor: 'pointer',
                fontSize: '10px',
              }}>{ __('SHOW PASSWORD') }</a>
          </div>
        );
      }
    } else if (this.state.mode === 'apsta') {
      if (this.state.apstaContent.encryption) {
        staPassword = (
          <div>
            <TextField
              style={{ width: '100%' }}
              value={ this.state.apstaContent.key }
              hintText={__('Please enter your password')}
              floatingLabelStyle={{ color: 'rgba(0, 0, 0, 0.498039)' }}
              underlineFocusStyle={{ borderColor: Colors.amber700 }}
              type={ textType }
              onChange={
                (e) => {
                  this.setState({
                    apstaContent: {
                      ssid: this.state.apstaContent.ssid,
                      key: e.target.value,
                      encryption: true,
                      repeaterSsid: this.state.apstaContent.repeaterSsid,
                      repeaterKey: this.state.apstaContent.repeaterKey,
                    },
                  });
                }
              }
              floatingLabelText={__('Password')} />
            <a
              onTouchTap={
                () => {
                  this.setState({
                    showPassword: !this.state.showPassword,
                  });
                }
              }
              style={{
                textAlign: 'left',
                color: Colors.amber700,
                textDecoration: 'none',
                cursor: 'pointer',
                fontSize: '14px',
              }}>{ __('SHOW PASSWORD') }</a>
          </div>
        );
      }
    }

    switch (this.state.mode) {
    case 'ap':
      elemWIFI = (
        <div>
          <TextField
          hintText={__('Input your SSID')}
          type="text"
          value={ this.state.apContent.ssid }
          style={{ width: '100%' }}
          onChange={
            (e) => {
              this.setState({
                apContent: {
                  ssid: e.target.value,
                  key: this.state.apContent.key,
                },
              });
            }
          }
          underlineFocusStyle={{ borderColor: Colors.amber700 }}
          floatingLabelStyle={{ color: 'rgba(0, 0, 0, 0.498039)' }}
          floatingLabelText={
            <div>
              { __('Network name') } <b style={{ color: 'red' }}>*</b>
            </div>
          } />
          <TextField
            hintText={__('Please enter your password')}
            errorStyle={{ borderColor: Colors.amber700 }}
            errorText={ errorText }
            type={ textType }
            underlineFocusStyle={{ borderColor: Colors.amber700 }}
            floatingLabelStyle={{ color: 'rgba(0, 0, 0, 0.498039)' }}
            value={ this.state.apContent.key }
            onChange={
              (e) => {
                if ( e.target.value.length > 0 && e.target.value.length < 8) {
                  this.setState({
                    apContent: {
                        ssid: this.state.apContent.ssid,
                        key: e.target.value,
				        encryption: this.state.apContent.encryption,
				      	wanProto: this.state.apContent.wanProto,
				     	wan_orig_ifname: this.state.apContent.wan_orig_ifname,
				     	wan_orig_bridge: this.state.apContent.wan_orig_bridge,
				     	wanIfname: this.state.apContent.wanIfname,
                    },
                    notPassPassword: true,
                  });
                } else if (e.target.value.length === 0) {
                  this.setState({
                    apContent: {
                        ssid: this.state.apContent.ssid,
                        key: e.target.value,
				        encryption: this.state.apContent.encryption,
				      	wanProto: this.state.apContent.wanProto,
				     	wan_orig_ifname: this.state.apContent.wan_orig_ifname,
				     	wan_orig_bridge: this.state.apContent.wan_orig_bridge,
				     	wanIfname: this.state.apContent.wanIfname,
                    },
                    notPassPassword: false,
                  });
                } else {
                  this.setState({
                    apContent: {
                        ssid: this.state.apContent.ssid,
                        key: e.target.value,
				        encryption: this.state.apContent.encryption,
				      	wanProto: this.state.apContent.wanProto,
				     	wan_orig_ifname: this.state.apContent.wan_orig_ifname,
				     	wan_orig_bridge: this.state.apContent.wan_orig_bridge,
				     	wanIfname: this.state.apContent.wanIfname,
                    },
                    notPassPassword: false,
                  });
                }
              }
            }
            style={{ width: '100%' }}
            floatingLabelText={__('Password')} />
            <div style={ showPasswordStyle }>
            <a
              onTouchTap={
                () => {
                  this.setState({
                    showPassword: !this.state.showPassword,
                  });
                }
              }
              style={{
                textAlign: 'left',
                color: Colors.amber700,
                textDecoration: 'none',
                cursor: 'pointer',
                fontSize: '10px',
              }}>{ __('SHOW PASSWORD') }</a>
          </div>
        </div>
      );

      break;
    case 'sta':
      elemWIFI = (
        <div>
          <SelectField
            style={{
              width: '100%',
              maxWidth: '512px',
              position: 'absolute',
            }}
            multiLine
            underlineStyle={{ maxHeight: '100px', overflow: 'hidden' }}
            menuItemStyle={{ maxHeight: '100px' }}
            floatingLabelStyle={{ color: 'rgba(0, 0, 0, 0.498039)' }}
            underlineFocusStyle={{ borderColor: Colors.amber700 }}
            floatingLabelText={
              <div>
                { __('Detected Wi-Fi network') } <b style={{ color: 'red' }}>*</b>
              </div>
            }
            onChange={ this._handleSelectValueChange.bind(null, 'selectValue') }
            value={ Number(this.state.selectValue) }
            menuItems={ this.state.wifiList } />
          <RaisedButton style={{ marginTop: '75px' }} label={__('Refresh')} onTouchTap={ this._scanWifi } />
          <br />
          { staPassword }
        </div>
      );
      break;
    case 'apsta':
      elem = (
        <div>
          <SelectField
            style={{
              width: '100%',
              maxWidth: '512px',
              position: 'absolute',
            }}
            multiLine
            underlineStyle={{ maxHeight: '100px', overflow: 'hidden' }}
            menuItemStyle={{ maxHeight: '100px' }}
            floatingLabelStyle={{ color: 'rgba(0, 0, 0, 0.498039)' }}
            underlineFocusStyle={{ borderColor: Colors.amber700 }}
            floatingLabelText={
              <div>
                { __('Detected Wi-Fi network') } <b style={{ color: 'red' }}>*</b>
              </div>
            }
            onChange={ this._handleSelectValueChange.bind(null, 'selectValue') }
            value={ Number(this.state.selectValue) }
            menuItems={ this.state.wifiList } />
          <RaisedButton style={{ marginTop: '75px' }} label={__('Refresh')} onTouchTap={ this._scanWifi } />
          <br />
          { staPassword }
          <TextField
            hintText={__('Input your SSID')}
            type="text"
            value={ this.state.apstaContent.repeaterSsid }
            style={{ width: '100%' }}
            onChange={
              (e) => {
                this.setState({
                  apstaContent: {
                    ssid: this.state.apstaContent.ssid,
                    key: this.state.apstaContent.key,
                    encryption: this.state.apstaContent.encryption,
                    repeaterSsid: e.target.value,
                    repeaterKey: this.state.apstaContent.repeaterKey,
                  },
                });
              }
            }
            underlineFocusStyle={{ borderColor: Colors.amber700 }}
            floatingLabelStyle={{ color: 'rgba(0, 0, 0, 0.498039)' }}
            floatingLabelText={
              <div>
                { __('Repeater SSID') } <b style={{ color: 'red' }}>*</b>
              </div>
            }
          />
          <TextField
            hintText={__('Please enter your password')}
            errorStyle={{ borderColor: Colors.amber700 }}
            errorText={ errorText }
            type={ repeaterTextType }
            underlineFocusStyle={{ borderColor: Colors.amber700 }}
            floatingLabelStyle={{ color: 'rgba(0, 0, 0, 0.498039)' }}
            value={ this.state.apstaContent.repeaterKey }
            onChange={
              (e) => {
                if ( e.target.value.length > 0 && e.target.value.length < 8) {
                  this.setState({
                    apstaContent: {
                      ssid: this.state.apstaContent.ssid,
                      key: this.state.apstaContent.key,
                      encryption: this.state.apstaContent.encryption,
                      repeaterSsid: this.state.apstaContent.repeaterSsid,
                      repeaterKey: e.target.value,
                    },
                    notPassRepeaterPassword: true,
                  });
                } else if (e.target.value.length === 0) {
                  this.setState({
                    apstaContent: {
                      ssid: this.state.apstaContent.ssid,
                      key: this.state.apstaContent.key,
                      encryption: this.state.apstaContent.encryption,
                      repeaterSsid: this.state.apstaContent.repeaterSsid,
                      repeaterKey: e.target.value,
                    },
                    notPassRepeaterPassword: false,
                  });
                } else {
                  this.setState({
                    apstaContent: {
                      ssid: this.state.apstaContent.ssid,
                      key: this.state.apstaContent.key,
                      encryption: this.state.apstaContent.encryption,
                      repeaterSsid: this.state.apstaContent.repeaterSsid,
                      repeaterKey: e.target.value,
                    },
                    notPassRepeaterPassword: false,
                  });
                }
              }
            }
            style={{ width: '100%' }}
            floatingLabelText={__('Repeater password')} />
            <div style={ showPasswordStyle }>
            <a
              onTouchTap={
                () => {
                  this.setState({
                    showRepeaterPassword: !this.state.showRepeaterPassword,
                  });
                }
              }
              style={{
                textAlign: 'left',
                color: Colors.amber700,
                textDecoration: 'none',
                cursor: 'pointer',
                fontSize: '14px',
              }}>{ __('SHOW PASSWORD') }</a>
          </div>
        </div>
      );
      break;
    default:
      break;
    }

    return (
      <div>
        <Card>
          <Dialog
            title={__('Device Restarting. Please Wait…')}
            actionFocus="submit"
            actions={ boardMsgActions }
            ref="boardMsgDialog"
            modal={ this.state.modal }>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <p style={{
              fontSize: '16px',
              color: '#999A94',
              lineHeight: '18.54px',
              marginTop: '-15px',
            }}>{ __('See the Wi-Fi LED, it will light on steadily and start to blink or turn off afterwards. When the LED starts to blink or turn off, reload this webpage to sign in again.')}</p>
            <p style={{
              fontSize: '16px',
              color: '#999A94',
              lineHeight: '18.54px',
            }}>{ __('Note: Please make sure your host computer is in the ')} { this.state[ this.state.mode + 'Content'].ssid } {__('network. You can’t access this page if it’s in a different network.')}</p>
            </div>
          </Dialog>
          <Dialog
            title={ this.state.errorMsgTitle }
            actions={ errMsgActions }
            actionFocus="submit"
            ref="errorDialog"
            modal={ this.state.modal }>
            <p style={{ color: '#999A94', marginTop: '-20px' }}>{ this.state.errorMsg }</p>
          </Dialog>
          <div style={ styles.content }>
            <h3>{__('Network mode')}</h3>
            <RadioButtonGroup name="mode" defaultSelected={ this.state.mode } style={{ display: 'flex', paddingTop: '20px' }} >
              <RadioButton
                value="ap"
                style={{
                  color: Colors.amber700,
                  marginBottom: 16,
                  marginRight: 50,
                  width: '150px',
                }}
                label={__('AP mode')}
                onTouchTap={() => this._onRadioButtonClick('ap')}/>
              <RadioButton
                value="sta"
                label={__('Station mode')}
                onTouchTap={() => this._onRadioButtonClick('sta')}
                style={{
                  color: Colors.amber700,
                  marginBottom: 16,
                  marginLeft: 50,
                  width: '170px',
                }}/>
            </RadioButtonGroup>
            <div style={{ borderTop: '1px solid rgba(255,156,52,1)', marginTop: '20px', marginBottom: '0px' }}></div>
            <h3 style={{
                textAlign: 'left',
                textDecoration: 'none',
                fontSize: '12px',
                marginBottom: '-5px',
              }}>{__('WIFI')}</h3>
            { elemWIFI }
            <div style={{ borderTop: '1px solid rgba(255,156,52,1)', marginTop: '20px', marginBottom: '0px' }}></div>
            <h3 style={{
                textAlign: 'left',
                textDecoration: 'none',
                fontSize: '12px',
                marginBottom: '-5px',
              }}>{__('WAN')}</h3>
             { elemNET }
             { elemNET2 }
             { elemNET3 }
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
              <RaisedButton
                linkButton
                label={__('Cancel')}
                style={{
                  width: '236px',
                  flexGrow: 1,
                  textAlign: 'center',
                  marginTop: '20px',
                  marginBottom: '20px',
                  marginRight: '10px',
                }}
                backgroundColor="#EDEDED"
                labelColor="#999A94" />            
              <RaisedButton
                linkButton
                secondary
                label={__('Configure & Restart')}
                backgroundColor={ Colors.amber700 }
                onTouchTap={ this._handleSettingMode }
                style={{
                  width: '236px',
                  flexGrow: 1,
                  textAlign: 'center',
                  marginTop: '20px',
                  marginBottom: '20px',
                  marginLeft: '10px',
                }} />
            </div>
          </div>
        </Card>
      </div>
    );
  }
  _scanWifi() {
    const this$ = this;
    return AppActions.scanWifi(window.session)
    .then((data) => {
      let selectValue;
      const staModeInfo = this$.state.staContent;
      const apstaModeInfo = this$.state.apstaContent;

      for (let i = 0; i < data.body.result[1].results.length; i++ ) {
        data.body.result[1].results[i].payload = i + 1;
        data.body.result[1].results[i].text = data.body.result[1].results[i].ssid + ' ( ' + data.body.result[1].results[i].quality + ' % )';

        // To know which wifi use this wifi ssid.
        if (this$.props.boardInfo.wifi.sta.ssid === data.body.result[1].results[i].ssid) {
          selectValue = i + 1;
          staModeInfo.encryption = data.body.result[1].results[i].encryption.enabled;
          apstaModeInfo.encryption = data.body.result[1].results[i].encryption.enabled;
        }
      }

      return this$.setState({
        selectValue: selectValue,
        staContent: staModeInfo,
        apstaContent: apstaModeInfo,
        wifiList: data.body.result[1].results,
      });
    });
  }

  _onRadioButtonClick(mode) {
    switch (mode) {
    case 'ap':
      this.state.staContent.wanProto = '';
      if (this.state.apContent.key.length > 0 && this.state.apContent.key.length < 8) {
        this.setState({ mode: mode, notPassPassword: true, showPassword: false});
      } else {
        this.setState({ mode: mode });
      }
      break;
    case 'sta':
      this.state.apContent.wanProto = '';
      this.setState({ mode: mode, notPassPassword: false, showPassword: false, showRepeaterPassword: false, notPassRepeaterPassword: false });
      break;
    case 'apsta':
      if (this.state.apstaContent.key.length > 0 && this.state.apstaContent.key.length < 8) {
        this.setState({ mode: mode, notPassPassword: false, showPassword: false, showRepeaterPassword: false, notPassRepeaterPassword: false });
      } else {
        this.setState({ mode: mode });
      }
      break;
    default:
      break;
    }
  }

  _returnToIndex(successMsg, errorMsg) {
    if (successMsg) {
      this.refs.boardMsgDialog.show();
      this.setState({ boardSuccessMsg: successMsg });
    } else {
      if (AppActions.isLocalStorageNameSupported) {
        delete window.localStorage.session;
        delete window.localStorage.info;
      } else {
        delete window.memoryStorage.session;
        delete window.memoryStorage.info;
      }
      return AppDispatcher.dispatch({
        APP_PAGE: 'LOGIN',
        successMsg: successMsg || null,
        errorMsg: errorMsg || null,
      });
    }
  }

  _handleSelectValueChange(name, e) {
    const change = {};
    change[name] = e.target.value;

    change.staContent = {};
    change.staContent.key = '';
    change.staContent.ssid = this.state.wifiList[e.target.value - 1].ssid;
    change.staContent.encryption = this.state.wifiList[e.target.value - 1].encryption.enabled;
    change.apstaContent = {};
    change.apstaContent.key = '';
    change.apstaContent.ssid = this.state.wifiList[e.target.value - 1].ssid;
    change.apstaContent.encryption = this.state.wifiList[e.target.value - 1].encryption.enabled;
    change.apstaContent.repeaterSsid = this.state.apstaContent.repeaterSsid;
    change.apstaContent.repeaterKey = this.state.apstaContent.repeaterKey;

    change.staContent.wanIpaddr = this.state.staContent.wanIpaddr;
    change.staContent.wanProto = this.state.staContent.wanProto;
    change.staContent.wanNetmask = this.state.staContent.wanNetmask;
    change.staContent.wanGateway = this.state.staContent.wanGateway;
    change.staContent.wanDns = this.state.staContent.wanDns;
    change.staContent.wan_orig_ifname = this.state.staContent.wan_orig_ifname;
    change.staContent.wan_orig_bridge = this.state.staContent.wan_orig_bridge;
    change.staContent.wanIfname = this.state.staContent.wanIfname;

    this.setState(change);
  }

  _handleSettingMode() {
    const this$ = this;
    if (this.state.notPassPassword) {
      return false;
    }
    return AppActions.setWifi(this.state.mode, this.state[ this.state.mode + 'Content'], window.session)
    .then(() => {
      return AppActions.setWifiMode(this.state.mode, window.session);
    })
    .then(() => {
      return AppActions.setNet(this.state.mode, this.state[ this.state.mode + 'Content'], window.session);
    })
    .then(() => {
      return AppActions.commitAndReboot(window.session)
      .catch((err) => {
        if (err === 'no data') {
          return false;
        }
        return err;
      });
    })
    .then(() => {
      return this$._returnToIndex(__('Configuration saved. You can sign in to the console after your device has restarted.'));
    })
    .catch((err) => {
      if (err === 'Access denied') {
        this$.setState({
          errorMsgTitle: __('Access denied'),
          errorMsg: __('Your token was expired, please sign in again.'),
        });
        return this$.refs.errorMsg.show();
      }
      alert('[' + err + '] Please try again!');
    });
  }

  _cancelBoardMsgDialog() {
    this.refs.boardMsgDialog.dismiss();
    if (AppActions.isLocalStorageNameSupported) {
      delete window.localStorage.session;
      delete window.localStorage.info;
    } else {
      delete window.memoryStorage.session;
      delete window.memoryStorage.info;
    }
    const this$ = this;
    return AppDispatcher.dispatch({
      APP_PAGE: 'LOGIN',
      successMsg: this$.state.boardSuccessMsg || null,
      errorMsg: null,
    });
  }

  _cancelErrorMsgDialog() {
    this.refs.errorDialog.dismiss();
    this._returnToIndex();
  }


}

networkComponent.childContextTypes = {
  muiTheme: React.PropTypes.object,
};
