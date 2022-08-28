import React, { ReactNode } from "react";
import { Box, Button, Flex, Heading, HStack, Image, Text } from "@chakra-ui/react";
import "./index.css";

const DataSection = (props: { title: string; children: ReactNode }) => {
  return (
    <Box>
      <Box
        borderWidth="3px"
        borderBottomWidth={0}
        borderColor="yellow"
        borderTopRadius="6px"
        width="fit-content"
        paddingX="2rem"
      >
        <Text
          fontFamily="STARWARS"
          fontWeight="medium"
          fontSize="xl"
          color="yellow"
          fontStyle="italic"
          textTransform="uppercase"
        >
          {props.title}
        </Text>
      </Box>

      <Box
        borderWidth="3px"
        borderColor="yellow"
        borderRadius="6px"
        padding="1rem"
        borderTopLeftRadius={0}
      >
        {props.children}
      </Box>
    </Box>
  );
};

const Plan = () => {
  return <DataSection title="Plan">test</DataSection>;
};

const Empire = () => {
  return <DataSection title="Empire intel">test</DataSection>;
};

const GiveMeTheOddsButton = () => {
  return (
    <Button
      size="lg"
      bg="yellow"
      boxShadow="xl"
      variant="unstyled"
      height="fit-content"
      borderColor="yellow"
      borderWidth="3px"
      _hover={{ bg: "transparent", color: "yellow" }}
      _active={{ boxShadow: "md", opacity: 0.7 }}
      color="gray.700"
    >
      <Text
        marginX="2rem"
        fontSize="4xl"
        transform="skew(-30deg)"
        textTransform="uppercase"
        fontFamily="STARWARS"
      >
        Give me the odds !
      </Text>
    </Button>
  );
};

function App() {
  return (
    <Box margin="3rem">
      <Box w="100%">
        <Image src="/never_tell_me_the_odds.gif" borderRadius="6px" boxShadow="lg" margin="auto" />
      </Box>

      <Box
        display="grid"
        gridGap="3rem"
        gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }}
        marginTop="4rem"
      >
        <Plan />
        <Empire />
      </Box>

      <Flex w="100%" justifyContent="center" marginTop="2rem">
        <GiveMeTheOddsButton />
      </Flex>
    </Box>
  );
}

export default App;
