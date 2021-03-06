import React, { Component } from 'react';
import firebase from 'firebase';
import './App.css';
import { SignIn } from './components/pages/signIn/signIn';
import { Home } from './components/pages/mainapp/home';
import { Info } from './components/pages/mainapp/info';
import { Map } from './components/pages/mainapp/map';
import { Navbar } from './components/navbar';
import userDataStore from './stores/userDataStore';

export class App extends Component {
  constructor(props) {
    super(props);

    const config = {
      apiKey: "AIzaSyDG6I5-16WszdcXaLgb3IGTBab1zJmbFCU",
      authDomain: "reefocus-app.firebaseapp.com",
      databaseURL: "https://reefocus-app.firebaseio.com",
      projectId: "reefocus-app",
      storageBucket: "reefocus-app.appspot.com",
      messagingSenderId: "567857954394"
    };
    firebase.initializeApp(config);

    this.state = {
      isLoading: true,
      isSignedIn: false,
      startup: true,
    }

    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.getCounts();
        this.setState({
          isLoading: false,
          isSignedIn: true,
        });
      } else {
        this.setState({
          isLoading: false,
          isSignedIn: false,
        });
      }
    });

    this.getCounts = this.getCounts.bind(this);
    this.updateCounts = this.updateCounts.bind(this);
    this.signIn = this.signIn.bind(this);
    this.googleAuthentication = this.googleAuthentication.bind(this);
    this.animationCompleted = this.animationCompleted.bind(this);
  }

  animationCompleted() {
    this.setState({
      startup: false
    })
  }

  render() {
    if (this.state.isLoading) {
      return (<div className="App"><div></div></div>);
    }

    if (this.state.isSignedIn) {
      return (
        <div className="App">
        
          <header className="App-header">
            {
              (this.props.location.pathname == "/") ? <Home startup={this.state.startup} isDone={this.animationCompleted} userDataStore={userDataStore}/> :
                (this.props.location.pathname == "/info") ? <Info userData={userDataStore}/> :
                  (this.props.location.pathname == "/map") ? <Map /> : null
            }
           
          </header>
          <Navbar location={this.props.location.pathname} userData={userDataStore} updateFirestore={this.updateCounts}/>
        </div>
        
      );
    } else {
      return (
        <div className="App">
          <header className="App-header">
            <SignIn signIn={this.signIn} />
          </header>
        </div>
      )
    }
  }

  // Firebase API

  // Populates userDataStore with counts from firebase
  getCounts() {
    const firestore = firebase.firestore();
    const settings = {/* your settings... */ timestampsInSnapshots: true};
    firestore.settings(settings);

    firestore.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get()
      .then((res) => {
        const userData = res.data();
        if(typeof userData == "undefined") {
          // If there is no data for user, set data using default values from userDataStore
          firestore.collection("users")
             .doc(firebase.auth().currentUser.uid)
             .set({
              points: userDataStore.points,
              bringWaterBottleCount: userDataStore.bringWaterBottleCount,
              refuseExtraPackagingCount: userDataStore.refuseExtraPackagingCount,
              bringOwnBagCount: userDataStore.bringOwnBagCount,
              bringCompostableObjectCount: userDataStore.bringCompostableObjectCount,
              carpoolCount: userDataStore.carpoolCount,
              publicTransitCount: userDataStore.publicTransitCount,
              bikeCount : userDataStore.bikeCount,
              walkCount : userDataStore.walkCount,
              events : userDataStore.events,
          });
          this.getCounts();
        } else {
          // Set userDataStore with data from firestore
          userDataStore.points = userData.points;
          userDataStore.bringWaterBottleCount = userData.bringWaterBottleCount;
          userDataStore.refuseExtraPackagingCount = userData.refuseExtraPackagingCount;
          userDataStore.bringOwnBagCount = userData.bringOwnBagCount;
          userDataStore.bringCompostableObjectCount = userData.bringCompostableObjectCount;
          userDataStore.carpoolCount = userData.carpoolCount;
          userDataStore.publicTransitCount = userData.publicTransitCount;
          userDataStore.bikeCount = userData.bikeCount;
          userDataStore.walkCount = userData.walkCount;
          userDataStore.events = userData.events;

          this.forceUpdate();
        }
      });
  }

  // Make sure to first update userDataStore 
  // Updates counts in firestore with userDataStore values
  updateCounts() {
    const firestore = firebase.firestore();
    const settings = {/* your settings... */ timestampsInSnapshots: true};
    firestore.settings(settings);

    firestore.collection("users")
             .doc(firebase.auth().currentUser.uid)
             .set({
              points: userDataStore.points,
              bringWaterBottleCount: userDataStore.bringWaterBottleCount,
              refuseExtraPackagingCount: userDataStore.refuseExtraPackagingCount,
              bringOwnBagCount: userDataStore.bringOwnBagCount,
              bringCompostableObjectCount: userDataStore.bringCompostableObjectCount,
              carpoolCount: userDataStore.carpoolCount,
              publicTransitCount: userDataStore.publicTransitCount,
              bikeCount : userDataStore.bikeCount,
              walkCount : userDataStore.walkCount,
              events : userDataStore.events,
          });
  }

  signIn() {
    this.googleAuthentication().then(() => {
      this.setState({ isSignedIn: true });
    }).catch((e) => {
      console.log("error: " + e);
    });
  }

  googleAuthentication() {
    const provider = new firebase.auth.GoogleAuthProvider();

    return new Promise((res, err) => {
      firebase.auth().signInWithPopup(provider).then(function (result) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const token = result.credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        // ...
        res();
      }).catch(function (error) {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        const credential = error.credential;
        err(errorCode + errorMessage + email + credential);
      });
    });
  }
}

export default App;
