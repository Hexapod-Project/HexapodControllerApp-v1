import React from 'react';
import { StyleSheet, Text } from 'react-native';
import Fangs from './components/Fangs';
import JoystickCluster from './components/JoystickCluster';
import LegSelector from './components/LegSelector';
import Leg, { LEG_W, LEG_H } from './components/Leg'
import BluetoothBtn from './components/BluetoothBtn';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { displayName, btAddr } from './app.json';
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import AutoRotateBtn from './components/AutoRotateBtn';

export const BTSTATES = {
  DISCONNECTED: "DISCONNECTED", CONNECTING: "CONNECTING",
  CONNECTED: "CONNECTED", DISABLED: "DISABLED"
};

export const BTDATA_STATES = {
  TRIPOD: 1,
  TRIPLE: 2,
  WAVE: 3,
  RIPPLE: 4,
  RISE: 5,
  CROUCH: 6,
  AUTOROT_ON: 7,
  AUTOROT_OFF: 8
}

export const BUFFER_LEN = 5;

const SENDDATA_INTERVAL = 20;

let btEnabledSub, btDisableSub, btDevConnectedSub, btErrorSub;

const initBluetooth = async (setBtState) => {

  try {
    let isAvailable = await RNBluetoothClassic.isBluetoothAvailable();

    if (isAvailable) {
      let isEnabled = await RNBluetoothClassic.isBluetoothEnabled();

      if (!isEnabled)
        setBtState(BTSTATES.DISABLED);
      else {
        let isConnected = await RNBluetoothClassic.isDeviceConnected(btAddr);

        if (isConnected && btState != BTSTATES.CONNECTED)
          setBtState(BTSTATES.CONNECTED);
      }
    } else
      setBtState(BTSTATES.DISABLED);
  } catch (err) {
    console.log(err);
  }

  btEnabledSub = RNBluetoothClassic.onBluetoothEnabled(e => {
    //If bluetooth is connected to Hexxo
    RNBluetoothClassic.isDeviceConnected(btAddr).then(isConnected => {
      if (isConnected)
        setBtState(BTSTATES.CONNECTED);
      else
        setBtState(BTSTATES.DISCONNECTED);
    }).catch(err => console.log(err));
  });

  btDisableSub = RNBluetoothClassic.onBluetoothDisabled(e => setBtState(BTSTATES.DISABLED));

  btDevConnectedSub = RNBluetoothClassic.onDeviceDisconnected(e => setBtState(BTSTATES.DISCONNECTED));

  btErrorSub = RNBluetoothClassic.onError(e => setBtState(BTSTATES.DISCONNECTED));
}

class App extends React.Component {
  state = {
    btState: BTSTATES.DISCONNECTED,
    autoRotate: true
  }

  databuffer = [];
  lastSentBuffer = Buffer(0);

  setBtState = (btState, callback) => {
    this.setState({ btState }, callback);
  }

  /**   
   * @param {Buffer} data 
   */
  addData = data => {

    if ((this.databuffer.length > 0 && this.databuffer[this.databuffer.length - 1].compare(data) != 0 || this.databuffer.length <= 0)
      && data.compare(this.lastSentBuffer) != 0)
      this.databuffer.push(data);
  }

  sendData = () => {
    if (this.state.btState == BTSTATES.CONNECTED && this.databuffer.length) {
      const data = this.databuffer.pop();
      RNBluetoothClassic.writeToDevice(btAddr, data).then(() => {
        this.lastSentBuffer = Buffer.from(data);
        console.log("Sent:", data, "Data left:", this.databuffer.length);
      }).catch(err => console.log(err));
    }
  }

  setAutoRotate = autoRotate => {
    this.setState({ autoRotate }, () => {
      const data = Buffer(BUFFER_LEN);
      data[BUFFER_LEN - 1] = autoRotate ? BTDATA_STATES.AUTOROT_ON : BTDATA_STATES.AUTOROT_OFF;
      this.addData(data);
    });
  }

  componentDidMount() {
    initBluetooth(this.setBtState).catch(err => console.log(err));

    setInterval(this.sendData, SENDDATA_INTERVAL);
  }

  componentDidUpdate() {
    if (this.state.btState != BTSTATES.CONNECTED)
      this.databuffer = [];
  }

  componentWillUnmount() {
    btEnabledSub.remove();
    btDisableSub.remove();
    btDevConnectedSub.remove();
    btErrorSub.remove();
  }

  render() {
    return (
      <SafeAreaProvider style={styles.layout}>
        <BluetoothBtn style={styles.bluetoothBtn} btState={this.state.btState} setBtState={this.setBtState} />
        <AutoRotateBtn style={styles.naturalWalkBtn} autoRotState={this.state.autoRotate} onPress={this.setAutoRotate} />
        <Text style={styles.name}>{displayName}</Text>
        <JoystickCluster style={styles.joystickCluster} btState={this.state.btState} addData={this.addData} databuffer={this.databuffer}/>
        <Fangs style={styles.fangs} />
        <LegSelector style={styles.leftleg} options={["Tripod", "Triple", "Wave", "Ripple"]} addData={this.addData} />
        <LegSelector style={styles.rightleg} options={["Rise", "Crouch"]} startIdx={1} isFlip={true} addData={this.addData} dataFirstIndex={5} />
      </SafeAreaProvider>
    );
  }
};

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#333",
    position: "relative",
  },
  bluetoothBtn: {
    position: "absolute",
    top: 15,
    right: 10
  },
  naturalWalkBtn: {
    borderColor: "orange",
    position: "absolute",
    top: 15,
    left: 10,
  },
  name: {
    color: "#fc9403",
    fontSize: 30,
    marginTop: 30,
    marginBottom: 20,
    marginLeft: 10,
    letterSpacing: 10,
    fontFamily: "PatchyRobots1",
  },
  leftleg: {
    position: "absolute",
    left: -LEG_W / 2,
    bottom: -LEG_H / 2,
  },
  rightleg: {
    position: "absolute",
    right: -LEG_W / 2,
    bottom: -LEG_H / 2,
  },
  fangs: {
    position: "relative",
    top: -30
  }
})

export default App;
