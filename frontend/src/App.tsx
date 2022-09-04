import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  Stack,
  Text,
  useStyleConfig,
  VStack,
} from "@chakra-ui/react";
import "./index.css";
import { useGetMillenniumFalcon, useGetRoutes, useGiveMeTheOdds } from "./services/hooks";
import { HiOutlineClock } from "react-icons/hi";
import { VscChromeClose } from "react-icons/vsc";
import { BsFillLightningChargeFill } from "react-icons/bs";
import { FaLongArrowAltRight } from "react-icons/fa";
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
const AutonomyIcon = iconFactory(BsFillLightningChargeFill);
const RightArrowIcon = iconFactory(FaLongArrowAltRight);

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

const useContainerDimensions = <T extends HTMLElement>(ref: React.MutableRefObject<T>) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const getDimensions = () => ({
      width: ref.current.offsetWidth,
      height: ref.current.offsetHeight,
    });

    const handleResize = () => {
      setDimensions(getDimensions());
    };

    if (ref.current) {
      setDimensions(getDimensions());
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [ref]);

  return dimensions;
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
  // Container dimensions are used to center the space chart in the parent Box
  const ref = useRef<HTMLDivElement>(null!);
  const { width, height } = useContainerDimensions(ref);

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
      <HStack fontFamily="STARWARS" fontWeight="medium" fontSize="xl" color="yellow" spacing="0">
        <Text>{millenniumFalcon?.autonomy}</Text>
        <AutonomyIcon />
      </HStack>

      <HStack
        fontFamily="STARWARS"
        fontWeight="medium"
        fontSize="xl"
        color="yellow"
        spacing="0.5rem"
      >
        <Text>{millenniumFalcon?.departure}</Text>
        <RightArrowIcon />
        <Text>{millenniumFalcon?.arrival}</Text>
      </HStack>
    </HStack>
  );

  return (
    <DataSection title="Plan">
      <Flex direction={{ base: "column", xl: "row" }}>
        <Box borderRightWidth={{ base: "0", xl: "3px" }} borderColor="yellow">
          <Data />
          <Box ref={ref}>
            <SpaceChart routes={routes || []} dimension={{ width, height }} />
          </Box>
        </Box>
        <Box padding="1rem">plan</Box>
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
      <Select defaultValue={value?.planet || "TITLE"} onChange={onChangePlanet} w="75%">
        <option value="TITLE" disabled>
          Select Planet
        </option>
        {planets.map((planet) => (
          <option key={planet} value={planet}>
            {planet}
          </option>
        ))}
      </Select>
      <Input
        type="number"
        min={0}
        placeholder="Day"
        value={value?.day}
        onChange={onChangeDay}
        w="25%"
      />
      <IconButton
        aria-label="remove input"
        icon={<CloseIcon />}
        size="md"
        variant="solid"
        colorScheme="yellow"
        bg="yellow"
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
        <Stack
          direction={{ base: "column", md: "row" }}
          padding="1rem"
          borderBottomWidth="3px"
          borderColor="yellow"
        >
          <Text
            fontWeight="bold"
            color="yellow"
            fontFamily="STARWARS"
            fontSize="lg"
            width={{ base: "100%", md: "15rem" }}
          >
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
        </Stack>

        <Stack
          direction={{ base: "column", md: "row" }}
          padding="1rem"
          w="100%"
          justifyContent="space-between"
        >
          <Text
            fontWeight="bold"
            color="yellow"
            fontFamily="STARWARS"
            fontSize="lg"
            width={{ base: "100%", md: "15rem" }}
          >
            Bounty hunters
          </Text>
          <VStack alignItems="flex-start" width="100%" justifyContent="space-between">
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
              bg="yellow"
              fontFamily="STARWARS"
              fontWeight="thin"
              onClick={() => addNewBountyHunter()}
            >
              New bounty hunter
            </Button>
          </VStack>
        </Stack>
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
      whiteSpace="normal"
    >
      <Text
        marginX="2rem"
        fontSize="4xl"
        transform="skew(-30deg)"
        textTransform="uppercase"
        fontFamily="STARWARS"
        textAlign="center"
      >
        Give me the odds !
      </Text>
    </Button>
  );
};

function App() {
  return (
    <Box margin={{ base: "1rem", md: "3rem" }}>
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
