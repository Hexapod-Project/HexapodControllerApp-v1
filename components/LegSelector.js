import React, { useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { BUFFER_LEN } from '../App';
import Leg, { LEG_H } from './Leg';

const ACTIVE_COLOR = "#faec73";
const DEFAULT_COLOR = "#faec7322";
const OPTION_FONTSIZE = 18;
const OPTION_RADIUS = LEG_H / 2;
const Y_OFFSET = 10;
const X_OFFSET = 50;
const FIRSTLASTOPT_TOP_OFFSET = 14;

export default function LegSelector({ style, options = [], startIdx = 0, maxAngle = Math.PI / 2, padAngle = 0.157, isFlip = false, addData, dataFirstIndex=1 }) {
    if (startIdx >= options.length)
        startIdx = options.length - 1;

    const gapRadian = options.length > 0 ? (maxAngle - padAngle) / (options.length - 1) : Math.PI / 4;
    const [selected, setSelected] = useState(startIdx <= options.length - 1 ? startIdx : 0);

    let startLegRad = gapRadian * startIdx;
    if (isFlip) startLegRad = -startLegRad;

    const legRadAnim = useRef(new Animated.Value(startLegRad)).current;
    const [legRad, setLegRad] = useState(startLegRad);
    legRadAnim.addListener(({ value }) => setLegRad(value));

    const setSelectedAndAddData = idx => {
        setSelected(idx);

        const data = Buffer(BUFFER_LEN);
        data[8] = dataFirstIndex + idx;
        addData(data);
    }

    const calculateLegRad = idx => {
        let rad = gapRadian * idx + padAngle / 2;

        const adjustedRad = maxAngle - rad;
        let y = OPTION_RADIUS - Math.sin(adjustedRad) * OPTION_RADIUS - Y_OFFSET;
        const x = Math.cos(adjustedRad) * OPTION_RADIUS + X_OFFSET;

        if (idx == 0 || idx == options.length - 1)
            y -= FIRSTLASTOPT_TOP_OFFSET;

        return { x, y, rad }
    }

    const setLegRadAnim = rad => {
        Animated.spring(legRadAnim, {
            toValue: (!isFlip ? rad : -rad),
            friction: 5,
            useNativeDriver: false
        }).start();
    }

    //Create options
    const optionTouchables = options.map((value, idx) => {
        const color = idx == selected ? ACTIVE_COLOR : DEFAULT_COLOR;

        const { x, y, rad } = calculateLegRad(idx);

        const optionPosStyle = { top: y }
        if (!isFlip)
            optionPosStyle.left = x;
        else
            optionPosStyle.right = x;

        return (
            <Text key={value} numberOfLines={1}
                style={{ ...styles.option, ...optionPosStyle, color, textAlign: (isFlip ? "right" : "left") }}
                onPress={() => {
                    setSelectedAndAddData(idx);
                    setLegRadAnim(rad);
                }}>
                {value}
            </Text>
        );
    });

    return (
        <View style={style}>
            {optionTouchables}
            <View onTouchStart={() => {
                const idx = selected < options.length - 1 ? selected + 1 : 0;
                const { rad } = calculateLegRad(idx);
                setLegRadAnim(rad);
                setSelectedAndAddData(idx);
            }
            }>
                <Leg style={{ transform: [{ rotate: `${legRad}rad` }] }} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    option: {
        position: "absolute",
        fontFamily: "MachineGunk",
        fontSize: OPTION_FONTSIZE,
        letterSpacing: 2,
        width: 100
    }
});