import React, { useEffect, useState } from 'react';
import { View, Text, Alert, Pressable, Button, Image, ImageBackground } from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import SelectDropdown from 'react-native-select-dropdown'
import Toast from 'react-native-simple-toast';

export default function Assignment1() {
    const [imageSource, setImageSource] = useState(null);
    const [image, setImage] = useState(null);


    const uploadImage = async () => {
        //Check if any file is selected or not
        const uri = 'http://localhost:3000/upload2';
        
        console.log('we taking', imageSource);

        const data = new FormData();
        data.append('image', image)
        const res = await fetch(
            uri,
            {
                method: 'POST',
                body: data,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        try {
            const responseJson = await res.json();
            if (responseJson.status == 'uploaded') {
                Toast.show(`Image Uploaded `, Toast.SHORT);
            }
        }
        catch (e) {
            Toast.show('Error Occured', Toast.SHORT);
            console.log(e);
        }


    };

    async function selectImage() {
        const result = await launchCamera({
            mediaType: 'photo',
            // maxWidth:28,
            // maxHeight:28,
            includeBase64: true,
            presentationStyle: 'formSheet'
        }, response => {
            if (response.didCancel) {
                Toast.show('Photo Not recieved', Toast.SHORT);
            } else if (response.error) {
                Toast.show('ImagePicker Error', Toast.SHORT);
            } else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            }
        });
        setImageSource(result.assets[0].uri);
        setImage({
            uri: result.assets[0].uri,
            type: result.assets[0].type,
            name: result.assets[0].fileName,
        });
    }

    return (
        <View>
            {imageSource ?
                <View>
                    <Text>Taken Photo is </Text>
                    <ImageBackground source={{ uri: imageSource }}
                        style={{ width: '70%', height: '70%' }}
                    />
                    <Pressable
                        style={({ pressed }) => [
                            { opacity: pressed ? 0.5 : 1.0 }
                        ]}>
                        <Button title='Upload'
                            onPress={uploadImage}></Button>
                        <Button title='Take a new Photo'
                            onPress={selectImage}></Button>
                    </Pressable>

                </View>
                :
                <View>
                    <Text >
                        Assignment1
                    </Text>
                    <Pressable
                        style={({ pressed }) => [
                            { opacity: pressed ? 0.5 : 1.0 }
                        ]}>
                        <Button title='Take a Photo'
                            onPress={selectImage}></Button>
                    </Pressable>
                </View>
            }
        </View >
    );
}
