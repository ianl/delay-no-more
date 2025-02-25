import React, { Component } from 'react';
import '../styles/Settings.css';

import Checkbox from 'material-ui/Checkbox';
import Snackbar from 'material-ui/Snackbar';
import {amber600, blueGrey900} from 'material-ui/styles/colors';
import ActionSettings from 'material-ui/svg-icons/action/settings';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Toggle from 'material-ui/Toggle';

import firebase from '../firebase';
const auth = firebase.auth();
const db = firebase.database();

const styles = {
  checkbox: {
    icon: {
      marginRight: '5px',
      fill: amber600
    }
  }
};

class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      blacklistActiveDays:{
        "MON": true,
        "TUE": true,
        "WED": true,
        "THUR": true,
        "FRI": true,
        "SAT": true,
        "SUN": true
      },
      bufferTime: 5 * 60 * 1000,
      snackbarOpen: false,
      snackbarMessage: "",
      debugMode: false
    }
  }

  componentDidMount() {
    auth.onAuthStateChanged(user => {
      if (user) {
        db.ref('settings').child(user.uid).child('blacklistActiveDays').on('value', snap => {
          console.log("snap.val():", snap.val());
          if (snap.val() !== null) {
            this.setState({
              blacklistActiveDays: {
                ...this.state.blacklistActiveDays,
                ...snap.val()
              }
            });            
          }
        });

        db.ref('settings').child(user.uid).child('bufferTime').on('value', snap => {
          console.log("snap.val():", snap.val());
          if (snap.val() !== null) {
            this.setState({
              bufferTime: snap.val()
            });            
          }
        }); 

        db.ref('settings').child(user.uid).child('debugMode').on('value', snap => {
          console.log("snap.val():", snap.val());
            this.setState({
              debugMode: snap.val() == null ? false : snap.val()
            });            
        }); 
      }
    });
  }

  componentWillUnmount() {}

  handleCheck = day => {
    auth.onAuthStateChanged(user => {
      if (user) {
        const p = !this.state.blacklistActiveDays[day];
        db.ref('settings').child(user.uid).child('blacklistActiveDays').child(day).set(p, err => {
          if (err) {
            this.setState({
              snackbarOpen: true,
              snackbarMessage: "Unable to save settings. Please try again."
            });            
          }
          else {
            this.setState({
              snackbarOpen: true,
              snackbarMessage: "Your settings have been saved"
            });
          }
        });
      }
    });
  };

  handleBufferTimeChange = (event, index, bufferTime) => {
    auth.onAuthStateChanged(user => {
      if (user) {
        db.ref('settings').child(user.uid).child('bufferTime').set(bufferTime, err => {
          if (err) {
            this.setState({
              snackbarOpen: true,
              snackbarMessage: "Unable to save settings. Please try again."
            });            
          }
          else {
            this.setState({
              snackbarOpen: true,
              bufferTime: bufferTime,
              snackbarMessage: "Your settings have been saved"
            });
          }
        });        
      }
    });  
  }

  handleSnackbarClose = () => {
    this.setState({
      snackbarOpen: false
    });
  };

  handleDebugModeToggle = () => {
    auth.onAuthStateChanged(user => {
      if (user) {
        const p = !this.state.debugMode;
        db.ref('settings').child(user.uid).child('debugMode').set(p, err => {
          if (err) {
            this.setState({
              snackbarOpen: true,
              snackbarMessage: "Unable to save settings. Please try again."
            });            
          }
          else {
            this.setState({
              snackbarOpen: true,
              snackbarMessage: "Your settings have been saved"
            });
          }
        });        
      }
    });    
  }

  render() {
    console.log("this.state:", this.state);

    return (
      <div className={this.props.className ? this.props.className : "settings"}>
        <h1 className="settings__title">
          <ActionSettings
            color={blueGrey900}
          /> Settings
        </h1>

        <div className="settings__category">
          <h2 className="settings-category__title">Farm</h2>
          <h3 className="settings-category__subtitle">Set daily buffer time</h3>
          <p className="settings-category__description">The buffer time allows you to surf on blacklisted websites without penalizing your farm's daily wage.</p>
          <div className="settings-category__set">
            <SelectField
              floatingLabelText="Current buffer time"
              value={this.state.bufferTime}
              onChange={this.handleBufferTimeChange}
            >
              <MenuItem value={0} primaryText="None" />
              <MenuItem value={5 * 60 * 1000} primaryText="5 mins" />
              <MenuItem value={10 * 60 * 1000} primaryText="10 mins" />
              <MenuItem value={15 * 60 * 1000} primaryText="15 mins" />
              <MenuItem value={30 * 60 * 1000} primaryText="30 mins" />
              <MenuItem value={60 * 60 * 1000} primaryText="1 Hour" />
            </SelectField>            
          </div>        
        </div>
        <div className="settings__category">
          <h2 className="settings-category__title">Blacklist</h2>
          <h3 className="settings-category__subtitle">Set active days</h3>
          <p className="settings-category__description">Select the days in which you want your blacklist to be activated.</p>
          <div className="settings-category__set">
            {Object.keys(this.state.blacklistActiveDays).map((day, index) =>
              <Checkbox
                key={index}
                label={day}
                checked={this.state.blacklistActiveDays[day]}
                onCheck={() => this.handleCheck(day)}
                className="blacklist-active-days__checkbox"
                iconStyle={styles.checkbox.icon}
              />
            )}
          </div>        
        </div>
        <div className="settings__category">
          <h2 className="settings-category__title">Developer options</h2>
          <Toggle
            label="Debug mode"
            labelPosition="right"
            toggled={this.state.debugMode}
            onToggle={this.handleDebugModeToggle}
          />        
        </div>

        <Snackbar
          open={this.state.snackbarOpen}
          message={this.state.snackbarMessage}
          autoHideDuration={4000}
          onRequestClose={this.handleSnackbarClose}
          contentStyle={{textAlign: 'center'}}
        />
      </div>
    );
  }
}

export default Settings;