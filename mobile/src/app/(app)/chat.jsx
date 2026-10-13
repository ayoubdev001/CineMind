import { useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { sendMessage } from "../../services/chatService";
import getErrorMessage from "../../utils/getErrorMessage";

const GREETING = {
  id: "greeting",
  role: "assistant",
  text: "Hi! Tell me what you're in the mood for and I'll suggest something from the catalog.",
  sources: [],
};

export default function Chat() {
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const listRef = useRef(null);
  const nextId = useRef(1);
  const insets = useSafeAreaInsets();

  const addMessage = (message) => {
    setMessages((current) => [
      ...current,
      { id: String(nextId.current++), sources: [], ...message },
    ]);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isSending) return;

    setInput("");
    addMessage({ role: "user", text });
    setIsSending(true);

    try {
      const { reply, sources } = await sendMessage(text);
      addMessage({ role: "assistant", text: reply, sources: sources ?? [] });
    } catch (error) {
      const message =
        error.code === "ECONNABORTED"
          ? "The assistant took too long to answer. Please try again."
          : getErrorMessage(error);
      addMessage({ role: "error", text: message });
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === "user";
    const isError = item.role === "error";

    return (
      <View style={[styles.messageRow, isUser ? styles.rowUser : styles.rowOther]}>
        <View
          style={[
            styles.bubble,
            isUser
              ? styles.bubbleUser
              : isError
              ? styles.bubbleError
              : styles.bubbleAssistant,
          ]}
        >
          <Text style={styles.bubbleText}>{item.text}</Text>
        </View>

        {item.sources.length > 0 ? (
          <View style={styles.sources}>
            {item.sources.map((source) => (
              <TouchableOpacity
                key={source.id}
                style={styles.sourceChip}
                onPress={() => router.push(`/movie/${source.id}`)}
              >
                <Ionicons name="film-outline" size={14} color="#A78BFA" />
                <Text style={styles.sourceText} numberOfLines={1}>
                  {source.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
      </View>
    );
  };

  const canSend = input.trim().length > 0 && !isSending;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(message) => message.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() =>
          listRef.current?.scrollToEnd({ animated: true })
        }
        ListFooterComponent={
          isSending ? (
            <View style={[styles.messageRow, styles.rowOther]}>
              <View style={[styles.bubble, styles.bubbleAssistant, styles.typing]}>
                <ActivityIndicator size="small" color="#A78BFA" />
                <Text style={styles.typingText}>Thinking...</Text>
              </View>
            </View>
          ) : null
        }
      />

      <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask for a movie..."
          placeholderTextColor="#969BB6"
          multiline
          maxLength={2000}
        />
        <TouchableOpacity
          style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!canSend}
        >
          <Ionicons name="send" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#01053b",
  },
  list: {
    padding: 16,
    paddingBottom: 8,
  },
  messageRow: {
    marginBottom: 14,
  },
  rowUser: {
    alignItems: "flex-end",
  },
  rowOther: {
    alignItems: "flex-start",
  },
  bubble: {
    maxWidth: "85%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleUser: {
    backgroundColor: "#7C3AED",
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: "#12185a",
    borderBottomLeftRadius: 4,
  },
  bubbleError: {
    backgroundColor: "#3B1A2A",
    borderWidth: 1,
    borderColor: "#F87171",
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    color: "#ffffff",
    fontSize: 15,
    lineHeight: 22,
  },
  typing: {
    flexDirection: "row",
    alignItems: "center",
  },
  typingText: {
    color: "#969BB6",
    fontSize: 14,
    marginLeft: 10,
  },
  sources: {
    flexDirection: "row",
    flexWrap: "wrap",
    maxWidth: "85%",
    marginTop: 8,
  },
  sourceChip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#7C3AED",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 6,
    marginBottom: 6,
    maxWidth: "100%",
  },
  sourceText: {
    color: "#ffffff",
    fontSize: 12,
    marginLeft: 5,
    flexShrink: 1,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#12185a",
    backgroundColor: "#01053b",
  },
  input: {
    flex: 1,
    maxHeight: 120,
    minHeight: 44,
    backgroundColor: "#0b1055",
    color: "#ffffff",
    fontSize: 15,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});