import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { style } from "../../assets/styles/create.style";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";

import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

import { useAuthStore } from "../../store/authStore";
import { BASE_URL } from "../../constants/urls";

export default function Create() {
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [rating, setRating] = useState(3);
  const [image, setImage] = useState(null); // to display the uploaded image
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { token } = useAuthStore();

  const pickImage = async () => {
    try {
      // request permission if needed
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        // console.log("status:", status);
        if (status !== "granted") {
          Alert.alert(
            "Permission Denied",
            "We need camera roll permissions to upload an image"
          );
          return;
        }
      }

      // launch image library
      const result = await ImagePicker.launchImageLibraryAsync({
        // here you can create an array to place multiple media types, for example:
        //  ["images", "videos"]
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5, // 1 is full quality, we lowered it for smaller base64 data transfer
        base64: true,
      });

      console.log("this is result:", result.assets[0].uri);

      if (!result.canceled) {
        // console.log("result is here:", result);
        setImage(result.assets[0].uri);

        // if base64 provided use it
        if (result.assets[0].base64) {
          setImageBase64(result.assets[0].base64);
        } else {
          // convert it to base64 and then set it
          const base64 = await FileSystem.readAsStringAsync(
            result.assets[0].uri,
            {
              encoding: FileSystem.EncodingType.Base64,
            }
          );
          setImageBase64(base64);
        }
      }
    } catch (err) {
      console.log("Error in pickImage create.jsx:", err);
      Alert.alert("Error", "There was a problem selecting your image");
    }
  };

  const handleSubmit = async () => {
    // console.log("TITLE:", title);
    // console.log("RATING:", rating);
    // console.log("CAPTION:", caption);
    // console.log("IMAGE BASE 64:", imageBase64);

    if (!title || !caption || !imageBase64 || !rating) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      setLoading(true);

      // get file extension from URI or default to jpeg
      const uriParts = image.split(".");
      const fileType = uriParts[uriParts.length - 1];
      const imageType = fileType
        ? `image/${fileType.toLowerCase()}`
        : "image/jpeg";

      const imageDataUrl = `data:${imageType};base64,${imageBase64}`;

      const response = await fetch(`${BASE_URL}/books`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          caption,
          rating: rating.toString(),
          image: imageDataUrl,
        }),
      });
      // console.log("response", await response.json());

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Something went wrong");

      console.log("DATA BABY:", data);

      Alert.alert("Success", "Your book recommendation has been posted!");

      setTitle("");
      setCaption("");
      setRating(3);
      setImage(null);
      setImageBase64(null);

      router.push("/");
    } catch (err) {
      console.log("Error in handleSubmit create.jsx:", err);
      Alert.alert("Error caught", err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const renderRatingPicker = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setRating(i)}
          style={style.starButton}
        >
          <Ionicons
            name={i <= rating ? "star" : "star-outline"}
            size={32}
            color={i <= rating ? "#f4b400" : COLORS.textSecondary}
          />
        </TouchableOpacity>
      );
    }
    return <View style={style.ratingContainer}>{stars}</View>;
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={style.container}
        style={style.scrollViewStyle}
      >
        <View style={style.card}>
          {/* header */}
          <View style={style.header}>
            <Text style={style.title}>Add Book Recommendation</Text>
            <Text style={style.subtitle}>
              Share your favorite reads with others
            </Text>
          </View>

          <View style={style.form}>
            {/* book title */}
            <View style={style.formGroup}>
              <Text style={style.label}>Book Title</Text>
              <View style={style.inputContainer}>
                <Ionicons
                  name="book-outline"
                  size={20}
                  color={COLORS.textSecondary}
                  style={style.inputIcon}
                />
                <TextInput
                  style={style.input}
                  placeholder="Enter book title"
                  placeholderTextColor={COLORS.placeholderText}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>
            </View>

            {/* rating */}
            <View style={style.formGroup}>
              <Text style={style.label}>Your Rating</Text>
              {renderRatingPicker()}
            </View>

            {/* image */}
            <View style={style.formGroup}>
              <Text style={style.label}>Book Image</Text>
              <TouchableOpacity style={style.imagePicker} onPress={pickImage}>
                {image ? (
                  <Image source={{ uri: image }} style={style.previewImage} />
                ) : (
                  <View style={style.placeholderContainer}>
                    <Ionicons
                      name="image-outline"
                      size={40}
                      color={COLORS.textSecondary}
                    />
                    <Text style={style.placeholderText}>
                      Tap to select image
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* description */}
            <View style={style.formGroup}>
              <Text style={style.label}>Caption</Text>
              <TextInput
                style={style.textArea}
                placeholder="Write your review or thoughts about this book..."
                placeholderTextColor={COLORS.placeholderText}
                value={caption}
                onChangeText={setCaption}
                multiline
              />
            </View>

            <TouchableOpacity
              style={style.button}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons
                    name="cloud-upload-outline"
                    size={20}
                    color={COLORS.white}
                    style={style.buttonIcon}
                  />
                  <Text style={style.buttonText}>Share</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
