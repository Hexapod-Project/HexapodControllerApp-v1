import React, { useLayoutEffect, useState } from 'react';
import { View } from 'react-native';
import Joystick from './Joystick'
import { BTSTATES, BUFFER_LEN } from '../App';

const JOYSTICK_W = 75;
const MINI_JOYSTICK_W = 40;
const JOYSTICK_COLOR = "#fcad03";
const MINIJOYSTICK_COLOR = "#00bfff";

const MARGIN = 10;

export default function JoystickCluster({ style, btState, addData }) {
    //Pos data is an array of positions for the joysticks which is indexed by the channel
    //Each pos data is a 16 bit Int which will be split into 2 group [0000 0000](grp 2)[0000 0000](grp 1) 
    //where grp 1 = X and grp 2 = Y and it ranges from 0 - 255
    //it will be mapped as such, 1 = min, 128 = 0, 256 = max  
    const [posData, setPosData] = useState(Buffer(BUFFER_LEN));

    useLayoutEffect(() => {
        if (btState != BTSTATES.CONNECTED)
            dataBuffer = [];
    }, [btState]);

    const setJoystickPosData = (channel, normX, normY) => {
        const newPosData = posData;
        const x = normX * 127 + 128;
        const y = normY * 127 + 128;
        newPosData[channel * 2] = x;
        newPosData[channel * 2 + 1] = y;

        if (btState == BTSTATES.CONNECTED)
            addData(newPosData);

        setPosData(newPosData);
    }

    return (
        <View style={{ ...style, flexDirection: "row" }}>
            <View style={{ flexDirection: "row", alignSelf:"flex-start" }}>
                {/**This shifts the body position */}
                <Joystick joystickWidth={MINI_JOYSTICK_W} joystickColor={MINIJOYSTICK_COLOR} btState={btState} setJoystickPosData={setJoystickPosData} channel={0} />
                {/**This moves the robot but always face forward*/}
                <Joystick joystickWidth={JOYSTICK_W} joystickColor={JOYSTICK_COLOR} btState={btState} setJoystickPosData={setJoystickPosData} channel={1} />
            </View>

            <View style={{ flexDirection: "row", alignSelf:"flex-end"}}>
                {/**This moves the robot and will rotate to face the input direction
                 * (If it is stationary, it will rotate to face the direction before moving,
                 * if it is moving, it will gradually move towards the direction)*/}
                <Joystick joystickWidth={JOYSTICK_W} joystickColor={JOYSTICK_COLOR} btState={btState} setJoystickPosData={setJoystickPosData} channel={2} />
                {/**This rotates the body to face the input direction
                 * (The body will rotate only in the range of [30, -30] or [120, 60] degrees from the front 
                 * and [240, 300] degrees from the back.
                 * the range from (120, 240) and (60, 300) will not be reachable)
                 */}
                <Joystick joystickWidth={MINI_JOYSTICK_W} joystickColor={MINIJOYSTICK_COLOR} btState={btState} setJoystickPosData={setJoystickPosData} channel={3} />
            </View>
        </View>
    );
}