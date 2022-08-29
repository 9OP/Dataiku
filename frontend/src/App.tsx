import React, { ReactNode } from "react";
import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  IconProps,
  Image,
  Text,
  useStyleConfig,
} from "@chakra-ui/react";
import "./index.css";
import { useGetMillenniumFalcon, useGetRoutes } from "./services/hooks";
import { GiElectric } from "react-icons/gi";
import { VscCircleLargeFilled, VscCircleLargeOutline } from "react-icons/vsc";
import { IconType } from "react-icons";

const iconFactory = (icon: IconType) => {
  return (props: IconProps) => {
    const styles = useStyleConfig("Icon");
    return <Icon __css={styles} as={icon} {...props} />;
  };
};

const AutonomyIcon = iconFactory(GiElectric);
const OriginIcon = iconFactory(VscCircleLargeOutline);
const DestinationIcon = iconFactory(VscCircleLargeFilled);

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

      <Box borderWidth="3px" borderColor="yellow" borderRadius="6px" borderTopLeftRadius={0}>
        {props.children}
      </Box>
    </Box>
  );
};

const Plan = () => {
  const { data: millenniumFalcon } = useGetMillenniumFalcon();
  const { data: routes } = useGetRoutes();

  const Autonomy = () => (
    <HStack fontFamily="STARWARS" fontWeight="medium" fontSize="xl" color="yellow" spacing="0">
      <AutonomyIcon />
      <Text>{millenniumFalcon?.autonomy}</Text>
    </HStack>
  );

  const Departure = () => (
    <HStack fontFamily="STARWARS" fontWeight="medium" fontSize="xl" color="yellow" spacing="0">
      <OriginIcon />
      <Text>{millenniumFalcon?.departure}</Text>
    </HStack>
  );

  const Arrival = () => (
    <HStack fontFamily="STARWARS" fontWeight="medium" fontSize="xl" color="yellow" spacing="0">
      <DestinationIcon />
      <Text>{millenniumFalcon?.arrival}</Text>
    </HStack>
  );
  const tiles = [<Autonomy />, <Departure />, <Arrival />];

  return (
    <DataSection title="Plan">
      <HStack spacing="2rem">
        <Autonomy />
        <Departure />
        <Arrival />
      </HStack>
    </DataSection>
  );
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
