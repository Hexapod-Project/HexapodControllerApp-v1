import React from 'react';
import { View } from 'react-native';
import { Path, Svg } from 'react-native-svg';

const FANG_COLOR = "#222"

export default function Fangs({style}) {
    return (
        <View style={{...style, flexDirection:"row"}}>
            <Svg height={100} width={70}>
                <Path transform="rotate(-10, 50.5389, 50.252)"
                    d="m53.5565,85.75201c-16.57459,0 -30,-15.88674 -30,-35.5c0,-19.61326 13.42541,-35.5 30,-35.5 c16.57459,0 34,20.88674 17,41.5c-17,20.61326 -0.42541,29.5 -17,29.5z"
                    fill={FANG_COLOR} />
            </Svg>


            <Svg style={{ transform: [{ scaleX: -1 }] }} height={100} width={70}>
                <Path
                    d="m53.5565,85.75201c-16.57459,0 -30,-15.88674 -30,-35.5c0,-19.61326 13.42541,-35.5 30,-35.5c16.57459,0 34,20.88674 17,41.5c-17,20.61326 -0.42541,29.5 -17,29.5z"
                    fill={FANG_COLOR} />
            </Svg>
        </View>
    );
}