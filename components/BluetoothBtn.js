import React, { useLayoutEffect, useState } from 'react';
import { ToastAndroid, TouchableHighlight } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RNBluetoothClassic, { BluetoothDevice } from 'react-native-bluetooth-classic';
import { displayName, btAddr } from '../app.json';
import { BTSTATES } from '../App';

const BTMESSAGES = {
    NOBLUETOOTH: "Please turn on your bluetooth",
    CONNECTING: `Connecting to ${displayName}...`,
    CONNECTED: `Successfully connected to ${displayName}!`,
    DISCONNECTED: `Disconnected from ${displayName}.`,
    FAILED: `Failed to connect to ${displayName}. Please make sure Hexxo is turned on and try again.`,
}

export default function BluetoothBtn({ style, btState, setBtState }) {
    const [isDisconnecting, setIsDisconnecting] = useState(false);

    /**     
     * @param {boolean} isConnected 
     * @param {BluetoothDevice} device 
     */
    const connectCallback = isConnected => {
        if (isConnected) {
            setBtState(BTSTATES.CONNECTED);
            ToastAndroid.show(BTMESSAGES.CONNECTED, ToastAndroid.LONG);
            // RNBluetoothClassic.writeToDevice(btAddr, "Hexxo App has successfully connected!")
            //     .catch(err => console.log(err));
        }
        else {
            setBtState(BTSTATES.DISCONNECTED);
            ToastAndroid.show(BTMESSAGES.FAILED, ToastAndroid.LONG);
        }
    }

    const failedToConnect = err => {
        setBtState(BTSTATES.DISCONNECTED);
        ToastAndroid.show(BTMESSAGES.FAILED, ToastAndroid.LONG);
        console.log(BTMESSAGES.FAILED, "Error:", err);
    }

    useLayoutEffect(() => {
        if (btState == BTSTATES.CONNECTING) {
            //Check if device has been paired
            RNBluetoothClassic.getBondedDevices().then(devices => {
                for (let i = 0; i < devices.length; i++) {
                    //If device is paired and is still connecting (not yet timeout)
                    if (devices[i].address == btAddr && btState == BTSTATES.CONNECTING) {
                        return devices[i].connect().then(connectCallback).catch(failedToConnect);
                    }
                }

                //If it is not paired
                RNBluetoothClassic.pairDevice(btAddr).then(device => {
                    device.connect().then(connectCallback).catch(failedToConnect);
                });
            });
        } else if (btState == BTSTATES.DISCONNECTED)
            setIsDisconnecting(false);
    }, [btState])

    const connect = () => {
        if (btState == BTSTATES.DISABLED)
            return ToastAndroid.show(BTMESSAGES.NOBLUETOOTH, ToastAndroid.LONG);

        if (btState == BTSTATES.CONNECTING)
            return ToastAndroid.show(BTMESSAGES.CONNECTING, ToastAndroid.SHORT);

        if (btState == BTSTATES.DISCONNECTED) {
            ToastAndroid.show(BTMESSAGES.CONNECTING, ToastAndroid.LONG);
            setBtState(BTSTATES.CONNECTING);
        } else if (!isDisconnecting) {
            // RNBluetoothClassic.writeToDevice(btAddr, "Hexxo App disconnecting...");
            RNBluetoothClassic.disconnectFromDevice(btAddr).then(() => {
                setIsDisconnecting(false);
                setBtState(BTSTATES.DISCONNECTED);
                ToastAndroid.show(BTMESSAGES.DISCONNECTED, ToastAndroid.LONG);
            }).catch(err => console.log(err));
            setIsDisconnecting(true);
        }
    }

    const color = btState == BTSTATES.CONNECTED ? "#0095ff" : "#999";

    let iconName = "bluetooth";

    if (btState == BTSTATES.DISABLED)
        iconName = "bluetooth-disabled";
    else if (btState == BTSTATES.CONNECTING)
        iconName = "bluetooth-searching"
    else if (btState == BTSTATES.CONNECTED)
        iconName = "bluetooth-connected"

    return <Icon name={iconName} color={color} size={35} underlayColor="#0000"
        style={style} onPress={connect} disabled={btState == BTSTATES.CONNECTING} />
}