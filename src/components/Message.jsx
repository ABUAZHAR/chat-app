import { Avatar, HStack, Text } from "@chakra-ui/react";
import React from "react";

export default function Message({ text, uri, user = "other" }) {
  return (
    <HStack
      alignSelf={user === "me" ? "flex-end" : "flex-start"}
      borderRadius={"base"}
      bg={user==="me"?"#0962ea":"#c2cfd8" }
      p={user === "me" ? 3 : 2}
    >
      {user === "other" && <Avatar src={uri} />}
      <Text color={"white"}>{text}</Text>
      {user === "me" && <Avatar src={uri} />}
    </HStack>
  );
}
