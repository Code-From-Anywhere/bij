import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import moment from "moment";
import * as React from "react";
import { Helmet } from "react-helmet";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import "react-native-gesture-handler";

function isEmail(email: string) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

const PARTICIPATION_YES = 2;
const PARTICIPATION_MAYBE = 1;
const PARTICIPATION_NO = 0;

const Stack = createStackNavigator();

const serverAddr = "https://bij.leckrapi.xyz";
const localAddr = "http://192.168.178.221:4004";
const devLocal = true;

const Constants = {
  SERVER_ADDR: __DEV__ && devLocal ? localAddr : serverAddr,
  VERSION: "1",
};
class HomeScreen extends React.Component {
  state = {
    loading: false,
    event: null,
    participation: null,
    name: "",
    email: "",
  };

  componentDidMount() {
    this.fetchEvent();
    this.fetchParticipant();
  }

  fetchEvent = () => {
    const address = Number(window.location.pathname?.split("/")[1]);

    if (address) {
      console.log("GOnna look for ", address);
      this.setState({ loading: true });
      const url = `${Constants.SERVER_ADDR}/event?id=${address}`;

      console.log("Url", url);
      return fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(async (response) => {
          this.setState({ event: response, loading: false });
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  fetchParticipant = () => {
    const participantToken = window.location.pathname?.split("/")[2];

    if (participantToken) {
      console.log("GOnna look for ", participantToken);
      this.setState({ loading: true });
      const url = `${Constants.SERVER_ADDR}/participant?participantToken=${participantToken}`;

      console.log("Url", url);
      return fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(async (response) => {
          this.setState({
            participation: response.attendance,
            name: response.name,
            email: response.email,
          });
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  postParticipate = () => {
    const { name, email, participation } = this.state;
    const address = Number(window.location.pathname?.split("/")[1]);
    const participantToken = window.location.pathname?.split("/")[2];

    if (!name || !email || participation === null) {
      alert("Voer a.u.b. alle velden in");
      return;
    }

    if (!isEmail(email)) {
      alert("Dat is geen geldig emailadres");
      return;
    }
    const url = `${Constants.SERVER_ADDR}/participate`;

    return fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventId: address,
        name,
        email,
        attendance: participation,
        participantToken,
      }),
    })
      .then((response) => response.json())
      .then(async (response) => {
        this.setState({ response });
      })
      .catch((error) => {
        console.error(error);
      });
  };
  render() {
    const { event, loading, response } = this.state;
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        {event && (
          <Helmet>
            <meta charSet="utf-8" />
            <title>{event.title} - Bij.link</title>
          </Helmet>
        )}

        {response ? (
          <Text>Mooi!</Text>
        ) : loading ? (
          <ActivityIndicator />
        ) : !event ? (
          <Text>Dit evenement bestaat niet meer</Text>
        ) : (
          <View>
            <Text style={{ fontSize: 32 }}>{event.title}</Text>
            <Text>{event.description}</Text>
            <Text style={{ fontWeight: "bold" }}>Wanneer?</Text>
            <Text style={{ marginBottom: 20 }}>
              {moment(new Date(event.date)).format("DD MMM YYYY HH:mm")} tot{" "}
              {moment(new Date(event.endDate)).format("DD MMM YYYY HH:mm")}{" "}
            </Text>

            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                onPress={() =>
                  this.setState({ participation: PARTICIPATION_YES })
                }
                style={{
                  backgroundColor: "green",
                  borderRadius: 10,
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 10,
                  marginHorizontal: 20,
                  borderWidth:
                    this.state.participation === PARTICIPATION_YES ? 5 : 0,
                  borderColor: "black",
                }}
              >
                <Text style={{ fontSize: 100 }}>🐝</Text>
                <Text style={{ color: "white" }}>Ik ben bij!</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  this.setState({ participation: PARTICIPATION_MAYBE })
                }
                style={{
                  backgroundColor: "gold",
                  borderRadius: 10,
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 10,
                  marginHorizontal: 20,
                  borderWidth:
                    this.state.participation === PARTICIPATION_MAYBE ? 5 : 0,
                  borderColor: "black",
                }}
              >
                <Text style={{ fontSize: 100 }}>🙈</Text>
                <Text>Misschien bij</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  this.setState({ participation: PARTICIPATION_NO })
                }
                style={{
                  backgroundColor: "gray",
                  borderRadius: 10,
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 10,
                  marginHorizontal: 20,
                  borderWidth:
                    this.state.participation === PARTICIPATION_NO ? 5 : 0,
                  borderColor: "black",
                }}
              >
                <Text style={{ fontSize: 100 }}>🥚</Text>
                <Text style={{ color: "white" }}>Niet bij</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="Je Naam"
              onChangeText={(text) => this.setState({ name: text })}
              value={this.state.name}
              style={{ fontSize: 40, marginTop: 30 }}
            />

            <TextInput
              placeholder="Je Email"
              onChangeText={(text) => this.setState({ email: text })}
              value={this.state.email}
              style={{ fontSize: 40, marginTop: 30 }}
            />

            <TouchableOpacity
              style={{ marginTop: 30 }}
              onPress={this.postParticipate}
            >
              <Text style={{ fontSize: 40, color: "blue" }}>Verzenden</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ header: () => null }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
