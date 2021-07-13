import React, { useLayoutEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated } from "react-native";
import { PanGestureHandler, PanGestureHandlerStateChangeEvent } from 'react-native-gesture-handler';
import Svg, { Circle } from 'react-native-svg';

export default function Joystick({ style, joystickColor = "gray", joystickWidth = 80, btState, setJoystickPosData, channel }) {
    const joystickRadius = joystickWidth / 2;
    const holderPad = joystickWidth * 0.7;
    const joystickMaxRadius = holderPad;
    const joystickMaxRadiusSqr = joystickMaxRadius * joystickMaxRadius;
    const joystickSize = { width: joystickWidth, borderRadius: joystickRadius };


    /**@type{Animated.ValueXY} */
    const rawTranslation = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
    const translation = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

    useLayoutEffect(() => {
        rawTranslation.addListener(({ x, y }) => {            
            if (x * x + y * y > joystickMaxRadiusSqr) {
                const angle = Math.atan2(y, x);
                x = Math.cos(angle) * joystickMaxRadius;
                y = Math.sin(angle) * joystickMaxRadius;
            }

            translation.setValue({ x, y });
            setJoystickPosData(channel, x / joystickMaxRadius, -y / joystickMaxRadius);
        });

        return () => {
            rawTranslation.removeAllListeners();
        }
    }, [btState]);

    const onGestureEvent = Animated.event([
        { nativeEvent: { translationX: rawTranslation.x, translationY: rawTranslation.y } }],
        { useNativeDriver: false });

    /**
     * @param {PanGestureHandlerStateChangeEvent} e 
     */
    const handlerEnd = e => {
        Animated.spring(translation, {
            toValue: {
                x: 0, y: 0
            },
            useNativeDriver: false,
        }).start();

        setJoystickPosData(channel, 0, 0);
    }

    return (
        <View style={{ ...styles.holder, padding: holderPad, borderRadius: joystickRadius + holderPad, ...style }}>
            <PanGestureHandler onGestureEvent={onGestureEvent}
                onEnded={handlerEnd} minDist={0} >
                <Animated.View
                    style={{
                        ...styles.joystick, backgroundColor: joystickColor, ...joystickSize,
                        transform: [{ translateX: translation.x }, { translateY: translation.y }]
                    }}>
                    <Svg width={joystickRadius} height={joystickRadius}>
                        <Circle r={joystickRadius / 2} fill="#000" cx={joystickRadius / 2} cy={joystickRadius / 2}></Circle>
                    </Svg>
                    <Svg width={joystickRadius} height={joystickRadius} style={{ position: "absolute", top: joystickRadius / 10, right: 0 }}>
                        <Circle r={joystickRadius / 4} fill="#fff5" cx={joystickRadius / 2} cy={joystickRadius / 2}></Circle>
                    </Svg>
                </Animated.View>
            </PanGestureHandler>
        </View>
    );
}

const styles = StyleSheet.create(
    {
        holder: {
            alignSelf: "flex-start",
            backgroundColor: "#ffffff",
            margin: 5
        },
        joystick: {
            aspectRatio: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        }
    }
)