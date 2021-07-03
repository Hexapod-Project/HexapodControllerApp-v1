import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function AutoRotateBtn({style, onPress, autoRotState}){

    const color = autoRotState ? "#0095ff" : "#999";

    return <Icon name="rotate-3d-variant" color={color} size={35} onPress={()=>onPress(!autoRotState)}
    underlayColor="#0000" style={style}/>
}