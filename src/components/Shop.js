import React, { Component } from 'react';
import ShopPanel from './ShopPanel';

import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from 'material-ui/Toolbar';
import { Tabs, Tab } from 'material-ui/Tabs';
import SwipeableViews from 'react-swipeable-views';
import FlatButton from 'material-ui/FlatButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import Dialog from 'material-ui/Dialog';
import Snackbar from 'material-ui/Snackbar';

import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faSeedling from '@fortawesome/fontawesome-free-solid/faSeedling';
import faSun from '@fortawesome/fontawesome-free-solid/faSun';
import faFire from '@fortawesome/fontawesome-free-solid/faFire';
import faMoneyBillAlt from '@fortawesome/fontawesome-free-solid/faMoneyBillAlt';
import faStar from '@fortawesome/fontawesome-free-solid/faStar';

import firebase from '../firebase';
const auth = firebase.auth();
const db = firebase.database();

class Shop extends Component {
  constructor() {
    super();
    this.state = {
      user: {
        totalEarning: 0
      },
      shop: {
        0: {category: 0, name: "Item 1", description: "Description 1", price: 1, isPremium: false},
        1: {category: 0, name: "Item 2", description: "Description 2", price: 2, isPremium: false},
        2: {category: 0, name: "Item 3", description: "Description 3", price: 3, isPremium: false},
        3: {category: 0, name: "Item 4", description: "Description 4", price: 4, isPremium: false},
        4: {category: 1, name: "Item 5", description: "Description 5", price: 500, isPremium: false},
        5: {category: 3, name: "A Gold Bar", description: "Description 7", price: 9.99, isPremium: true},
        6: {category: 3, name: "Chest of Gold", description: "Description 8", price: 19.99, isPremium: true},
        7: {category: 3, name: "Vault of Gold", description: "Description 9", price: 49.99, isPremium: true},
        8: {category: 3, name: "Bill Gates", description: "Description 10", price: 99.99, isPremium: true},
        9: {category: 2, name: "Fire Extinguisher", description: "Put out fire!", price: 10, isPremium: false},
      },
      inventory: {},
      slideIndex: 0,
      dialogOpen: false,
      itemToBePurchased: null,
      snackbarOpen: false,
      snackbarMessage: ""
    }
  }

  componentDidMount() {
    auth.onAuthStateChanged(user => {
      if (user) {
        db.ref('farm').child(user.uid).limitToLast(1).on('value', snap => {
          console.log("snap.val():", snap.val());
          this.setState({
            user: {
              totalEarning: snap.val() === null ? -1 : Object.values(snap.val())[0].totalEarning
            }
          });
        });

        db.ref('inventories').child(user.uid).on('value', snap => {
          console.log("snap.val():", snap.val());
          this.setState({
            inventory: snap.val() === null ? {} : snap.val()
          });
        });
      }
    });
  }

  componentWillUnmount() {}

  handleChange = value => {
    this.setState({
      slideIndex: value
    });
  };

  handleDialogOpen = k => {
    this.setState({
      dialogOpen: true,
      itemToBePurchased: k
    });
  }

  handleDialogClose = () => {
    this.setState({
      dialogOpen: false,
      itemToBePurchased: null
    });
  }

  handleSnackbarClose = () => {
    this.setState({
      snackbarOpen: false
    });
  }

  handlePurchase = () => {
    const k = this.state.itemToBePurchased;
    if (this.state.shop[k].isPremium) {
      this.handlePremiumPurchase();
    }
    else {
      this.handleNonPremiumPurchase();
    }
  }

  handleNonPremiumPurchase = () => {
    const k = this.state.itemToBePurchased;
    const newTotalEarning = this.state.user.totalEarning - this.state.shop[k].price;
    if (newTotalEarning < 0) {
      this.setState({
        snackbarOpen: true,
        snackbarMessage: "Insufficient funds to purchase item!"
      });   
    }
    else {
      auth.onAuthStateChanged(user => {
        if (user) {
          /*
          db.ref('farm').child(user.uid).limitToLast(1).update({
            totalEarning: newTotalEarning
          }).then(err => {
            if (err) {
              this.setState({
                snackbarOpen: true,
                snackbarMessage: "Unable to purchase item due to server problems. Please try again."
              });
            }
            else {
              this.setState({
                snackbarOpen: true,
                snackbarMessage: "Item purchased!"
              });
              this.handleDialogClose();
            }
          });
          */
         db.ref('inventories').child(user.uid).push(k, err => {
          if (err) {
            this.setState({
              snackbarOpen: true,
              snackbarMessage: "Unable to purchase item due to server problems. Please try again."
            });
          }
          else {
            this.setState({
              snackbarOpen: true,
              snackbarMessage: "Item purchased!"
            });
            this.handleDialogClose();
          }
         });
        }
      });
    }
  }

  handlePremiumPurchase = () => {
    console.log("handlePremiumPurchase()");
  }

  render() {
    console.log("this.state:", this.state);

    const tabStyle = {
      backgroundColor: "#8BC34A"
    }

    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onClick={this.handleDialogClose}
      />,
      <FlatButton
        label="Buy it"
        primary={true}
        onClick={this.handlePurchase}
        autoFocus
      />,
    ];

    return (
      <div id="shop">
        <Toolbar>
          <ToolbarGroup>
            <ToolbarTitle text="Shop" />
          </ToolbarGroup>
          <ToolbarGroup>
            <ToolbarTitle 
              text={
                <span>You have: <FontAwesomeIcon icon={faMoneyBillAlt} /> {this.state.user.totalEarning.toFixed(2)}</span>
              } 
            />
          </ToolbarGroup>
        </Toolbar>

        <Tabs
          onChange={this.handleChange}
          value={this.state.slideIndex}
        >
          <Tab 
            label="Infrastructure" 
            value={0} 
            icon={<FontAwesomeIcon icon={faSeedling} />}
            style={tabStyle}
          />
          <Tab 
            label="Background" 
            value={1} 
            icon={<FontAwesomeIcon icon={faSun} />}
            style={tabStyle}
          />
          <Tab
            label="Disaster Relief" 
            value={2} 
            icon={<FontAwesomeIcon icon={faFire} />}
            style={tabStyle}
          />
          <Tab
            label="Add Funds" 
            value={3} 
            icon={<FontAwesomeIcon icon={faMoneyBillAlt} />}
            style={tabStyle}
          />
        </Tabs>
        <SwipeableViews
          index={this.state.slideIndex}
          onChangeIndex={this.handleChange}
        >
          <ShopPanel category={0} 
            shop={this.state.shop} inventory={this.state.inventory} handleDialogOpen={this.handleDialogOpen} 
          />
          <ShopPanel category={1} 
            shop={this.state.shop} inventory={this.state.inventory} handleDialogOpen={this.handleDialogOpen}
          />
          <ShopPanel category={2} 
            shop={this.state.shop} inventory={this.state.inventory} handleDialogOpen={this.handleDialogOpen}
          />
          <ShopPanel category={3} 
            shop={this.state.shop} inventory={this.state.inventory} handleDialogOpen={this.handleDialogOpen}
          />
        </SwipeableViews>

        <Dialog
          title={this.state.itemToBePurchased == null ? "" : this.state.shop[this.state.itemToBePurchased].name}
          actions={actions}
          modal={false}
          open={this.state.dialogOpen}
          onRequestClose={this.handleDialogClose}
        >
          Are you sure you want to buy and use this item?
        </Dialog>

        <Snackbar
          open={this.state.snackbarOpen}
          message={this.state.snackbarMessage}
          autoHideDuration={4000}
          onRequestClose={this.handleSnackbarClose}
        />
      </div>
    );
  }
}

export default Shop;