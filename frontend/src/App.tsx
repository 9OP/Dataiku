import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  IconButton,
  IconProps,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Text,
  useStyleConfig,
  VStack,
} from "@chakra-ui/react";
import "./index.css";
import { useGetMillenniumFalcon, useGetRoutes, useGiveMeTheOdds } from "./services/hooks";
import { HiOutlineClock } from "react-icons/hi";
import { VscChromeClose } from "react-icons/vsc";
import { IconType } from "react-icons";
import SpaceChart from "./spaceChart";
import { BountyHunter, Empire } from "./models/models";

const iconFactory = (icon: IconType) => {
  return (props: IconProps) => {
    const styles = useStyleConfig("Icon");
    return <Icon __css={styles} as={icon} {...props} />;
  };
};

const CountdownIcon = iconFactory(HiOutlineClock);
const CloseIcon = iconFactory(VscChromeClose);

const EmpireIntelContext = createContext<{
  empire: Empire;
  setEmpire: React.Dispatch<React.SetStateAction<Empire>>;
}>(null!);

const EmpireIntelContextProvider = ({ children }: { children: ReactNode }) => {
  // Used for sharing Empire with EmpireIntel data section and the "Give me the odds" button
  const defaultEmpire: Empire = { countdown: 0, bountyHunters: [] };
  const [empire, setEmpire] = useState(defaultEmpire);
  return (
    <EmpireIntelContext.Provider value={{ empire, setEmpire }}>
      {children}
    </EmpireIntelContext.Provider>
  );
};

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

  const Data = () => (
    <HStack
      w="100%"
      justifyContent="space-between"
      padding="0.5rem"
      borderBottomWidth="3px"
      borderColor="yellow"
    >
      <HStack fontFamily="STARWARS" fontWeight="medium" fontSize="xl" color="yellow" spacing="1rem">
        <Text>Aut: </Text>
        <Text>{millenniumFalcon?.autonomy}</Text>
      </HStack>

      <HStack fontFamily="STARWARS" fontWeight="medium" fontSize="xl" color="yellow" spacing="1rem">
        <Text>Dpt: </Text>
        <Text>{millenniumFalcon?.departure}</Text>
      </HStack>

      <HStack fontFamily="STARWARS" fontWeight="medium" fontSize="xl" color="yellow" spacing="1rem">
        <Text>Arr: </Text>
        <Text>{millenniumFalcon?.arrival}</Text>
      </HStack>
    </HStack>
  );

  return (
    <DataSection title="Plan">
      <Flex direction={{ base: "column", xl: "row" }}>
        <Box borderRightWidth="3px" borderColor="yellow">
          <Data />
          <Box>
            <SpaceChart routes={routes || []} />
          </Box>
        </Box>
        <Box>plan</Box>
      </Flex>
    </DataSection>
  );
};

const BountyHunterInput = (props: {
  onRemove: () => void;
  value: BountyHunter;
  setValue: (hunter: Partial<BountyHunter>) => void;
  planets: string[];
}) => {
  const { onRemove, setValue, value, planets } = props;

  const onChangePlanet = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    const planet = e.target.value;
    setValue({ planet });
  };

  const onChangeDay = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const day = parseInt(e.target.value);
    if (!isNaN(day)) {
      setValue({ day });
    }
  };

  return (
    <HStack spacing="1rem" w="100%">
      <Select defaultValue={value?.planet || "TITLE"} onChange={onChangePlanet}>
        <option value="TITLE" disabled>
          Select Planet
        </option>
        {planets.map((planet) => (
          <option key={planet} value={planet}>
            {planet}
          </option>
        ))}
      </Select>
      <Input type="number" min={0} placeholder="Day" value={value?.day} onChange={onChangeDay} />
      <IconButton
        aria-label="remove input"
        icon={<CloseIcon />}
        size="md"
        variant="solid"
        colorScheme="yellow"
        onClick={onRemove}
      ></IconButton>
    </HStack>
  );
};

const EmpireIntel = () => {
  const { data: routes } = useGetRoutes();
  const { setEmpire } = useContext(EmpireIntelContext);
  const [countdown, setCountdown] = useState(0);
  const [bountyHunterId, setBountyHunterId] = useState(0);
  const [bountyHunters, setBountyHunters] = useState<{ [id: string]: BountyHunter }>({});

  useEffect(() => {
    // Update the context when local data change
    setEmpire({
      countdown,
      bountyHunters: Object.values(bountyHunters),
    });
  }, [countdown, bountyHunters, setEmpire]);

  const allPlanets = useMemo(
    () => [
      ...new Set(routes?.reduce((acc, r) => acc.concat([r.destination, r.origin]), [] as string[])),
    ],
    [routes]
  );

  const onChangeCountdown = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setCountdown(value);
    }
  };

  const setBountyHunter = (id: string) => {
    return (hunter: Partial<BountyHunter>) => {
      setBountyHunters((prev) => ({ ...prev, [id]: { ...prev[id], ...hunter } }));
    };
  };

  const removeBountyHunter = (id: string) => {
    return setBountyHunters(({ [id]: _, ...rest }) => rest);
  };

  const addNewBountyHunter = () => {
    setBountyHunterId((prev) => prev + 1);
    setBountyHunters((prev) => {
      return {
        ...prev,
        [bountyHunterId]: { day: 0, planet: "" },
      };
    });
  };

  return (
    <DataSection title="Empire intel">
      <VStack spacing="0" w="100%" justifyContent="space-between" alignItems="left">
        <HStack padding="1rem" borderBottomWidth="3px" borderColor="yellow">
          <Text fontWeight="bold" color="yellow" fontFamily="STARWARS" fontSize="lg" w="15rem">
            Countdown
          </Text>
          <InputGroup>
            <InputLeftElement pointerEvents="none" children={<CountdownIcon color="gray.300" />} />
            <Input
              type="number"
              min={0}
              placeholder="countdown"
              value={countdown}
              onChange={onChangeCountdown}
            />
          </InputGroup>
        </HStack>
        <HStack padding="1rem" w="100%">
          <Text fontWeight="bold" color="yellow" fontFamily="STARWARS" fontSize="lg" w="15rem">
            Bounty hunters
          </Text>
          <VStack alignItems="flex-start" width="100%">
            {Object.keys(bountyHunters).map((id) => (
              <BountyHunterInput
                key={id}
                value={bountyHunters?.[id]}
                onRemove={() => removeBountyHunter(id)}
                setValue={setBountyHunter(id)}
                planets={allPlanets}
              />
            ))}
            <Button
              size="md"
              variant="solid"
              colorScheme="yellow"
              onClick={() => addNewBountyHunter()}
            >
              New bounty hunter
            </Button>
          </VStack>
        </HStack>
      </VStack>
    </DataSection>
  );
};

const GiveMeTheOddsButton = () => {
  const { empire } = useContext(EmpireIntelContext);
  const { mutateAsync: giveMeTheOdds } = useGiveMeTheOdds();

  const onClick = async () => {
    const data = await giveMeTheOdds({ empire });
    // console.log(data);
    alert(JSON.stringify(data, null, 4));
  };

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
      onClick={onClick}
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

      <EmpireIntelContextProvider>
        <Box
          display="grid"
          gridGap="3rem"
          gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }}
          marginTop="4rem"
        >
          <Plan />
          <EmpireIntel />
        </Box>

        <Flex w="100%" justifyContent="center" marginTop="2rem">
          <GiveMeTheOddsButton />
        </Flex>
      </EmpireIntelContextProvider>
    </Box>
  );
}

export default App;
