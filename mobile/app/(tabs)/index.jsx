import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { style } from "../../assets/styles/home.style";
import { BASE_URL } from "../../constants/urls";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import { formatPublishDate } from "../../lib/utils";
import { useFocusEffect } from "@react-navigation/native";
import Loader from "../../components/Loader";

export default function Home() {
  const { token } = useAuthStore();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchBooks = async (pageNum = 1, refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      }

      const response = await fetch(
        `${BASE_URL}/books?page=${pageNum}&limit=5`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch books");
      }

      const uniqueBooks =
        refresh || pageNum === 1
          ? data.books
          : Array.from(
              new Set([...books, ...data.books].map((book) => book._id))
            ).map((id) =>
              [...books, ...data.books].find((book) => book._id === id)
            );

      setBooks(uniqueBooks);

      setHasMore(pageNum < data.totalPages);
      setPage(pageNum);
    } catch (err) {
      console.log("ERROR fetchBooks home screen:", err);
    } finally {
      if (refresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // used to refresh data when screen is "focused"
  useFocusEffect(
    React.useCallback(() => {
      fetchBooks();
    }, [])
  );

  const handleLoadMore = async () => {
    if (hasMore && !loading && !refreshing) {
      await fetchBooks(page + 1);
    }
  };

  const renderItem = ({ item }) => (
    <View style={style.bookCard}>
      <View style={style.bookHeader}>
        <View style={style.userInfo}>
          <Image
            source={{ uri: item.user.profileImage }}
            style={style.avatar}
          />
          <Text style={style.username}>{item.user.username}</Text>
        </View>
      </View>

      <View style={style.bookImageContainer}>
        <Image source={item.image} style={style.bookImage} contentFit="cover" />
      </View>

      <View style={style.bookDetails}>
        <Text style={style.bookTitle}>{item.title}</Text>
        <View style={style.ratingContainer}>
          {renderRatingStars(item.rating)}
        </View>
        <Text style={style.caption}>{item.caption}</Text>
        <Text style={style.date}>
          Shared on {formatPublishDate(item.createdAt)}
        </Text>
      </View>
    </View>
  );

  const renderRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={16}
          color={i <= rating ? "#f4b400" : COLORS.textSecondary}
          style={{ marginRight: 2 }}
        />
      );
    }
    return stars;
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBooks().then(() => {
      setRefreshing(false);
    });
  };

  if (loading) {
    return <Loader size="large" />;
  }

  return (
    <View style={style.container}>
      <FlatList
        data={books}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={style.listContainer}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View style={style.header}>
            <Text style={style.headerTitle}>BookWorm🐛</Text>
            <Text style={style.headerSubtitle}>
              discover great reads from the community👇
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={style.emptyContainer}>
            <Ionicons
              name="book-outline"
              size={60}
              color={COLORS.textSecondary}
            />
            <Text style={style.emptyText}>No recommendations yet</Text>
            <Text style={style.emptySubtext}>
              Be the first to share a book!
            </Text>
          </View>
        }
        ListFooterComponent={
          hasMore && books.length > 0 ? (
            <ActivityIndicator
              style={style.footerLoader}
              size="small"
              color={COLORS.primary}
            />
          ) : null
        }
      />
    </View>
  );
}
