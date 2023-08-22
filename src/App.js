import {
  Box,
  Button,
  Container,
  HStack,
  Input,
  VStack,
} from "@chakra-ui/react";
import Message from "./components/Message";
import {
  signOut,
  onAuthStateChanged,
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { app } from "./firebase";
import { useEffect, useRef, useState } from "react";
import {
  getFirestore,
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

const auth = getAuth(app);
const db = getFirestore(app);

const loginhandler = () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider).then((result) => {
    alert("You are Successfully Login");
  });
};

const logoutHandler = () => signOut(auth);

function App() {
  const [user, setuser] = useState(false);
  const [message, setmessage] = useState("");
  const [messages, setmessages] = useState([]);
  const divForScroll = useRef(null);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "Messages"), {
        text: message,
        uid: user.uid,
        uri: user.photoURL,
        createdAt: serverTimestamp(),
      });
      setmessage("");
      divForScroll.current.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      alert(error);
    }
  };

  useEffect(() => {
    const q = query(collection(db, "Messages"), orderBy("createdAt", "asc"));

    const unsubscribe = onAuthStateChanged(auth, (data) => {
      setuser(data);
    });
    const unsubscribeForMessages = onSnapshot(q, (snap) => {
      setmessages(
        snap.docs.map((item) => {
          const id = item.id;
          return { id, ...item.data() };
        })
      );
      // console.log("hello wrold")
    });
    return () => {
      unsubscribe();
      unsubscribeForMessages();
    };
  }, []);
  return (
    <Box h={"100vh"} bg={"#e7eaf6"}>
      {user ? (
        <Container h={"100vh"} bg={"#fafafa"}>
          <VStack h="full" py={"4"}>
            <Button onClick={logoutHandler} w={"full"} colorScheme={"blue"}>
              LOGOUT
            </Button>
            <VStack h={"full"} w={"full"} overflowY={"auto"} css={{"&::-webkit-scrollbar": {display:"none"}}}>
              {messages.map((item) => (
                <Message
                  text={item.text}
                  uri={item.uri}
                  user={item.uri === user.uid ? "me" : "other"}
                  key={item.id}
                />
              ))}
              <div ref={divForScroll}></div>
            </VStack>
            <form onSubmit={submitHandler} style={{ width: "100%" }}>
              <HStack>
                <Input
                  value={message}
                  onChange={(e) => setmessage(e.target.value)}
                  placeholder="Enter a Message"
                  border={"1px solid dimgray"}
                />
                <Button colorScheme="blue" type="submit">
                  Send
                </Button>
              </HStack>
            </form>
          </VStack>
        </Container>
      ) : (
        <VStack bg={"white"} h={"full"} justifyContent={"center"}>
          <Button colorScheme="blue" onClick={loginhandler}>
            Sign In with Google
          </Button>
        </VStack>
      )}
    </Box>
  );
}

export default App;
