import React from 'react';
import { Text, View,TouchableOpacity,StyleSheet,Image,TextInput } from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as firebase from "firebase";
import db from "../config";

export default class TransactionScreen extends React.Component {
  constructor(){
    super();
    this.state={
      hasCameraPermissions:null,
      scanned:false,
      scannedData:'',
      buttonState:'normal',
      scannedBookID:'',
      scannedStudentID:'',
      transactionMessage:'',
    }
  }
  getCameraPermissions=async(ID)=>{
    const {status}=await Permissions.askAsync(Permissions.CAMERA)
    this.setState({
      hasCameraPermissions:status==='granted',
      scanned:false,
      buttonState:ID,
    });
  }
  handleBarCodeScan=async({
    type,data
  })=>{
    const buttonState=this.state.buttonState;
    if(buttonState=="BookID"){
    this.setState({
      scanned:true,
      scannedBookID:data,
      buttonState:'normal'
    })}else if(buttonState=="StudentID"){
      this.setState({
        scanned:true,
        scannedStudentID:data,
        buttonState:'normal'
      })
    }
    }
    handleTransaction=async()=>{
      var transactionMessage
      db.collection("Books").doc(this.state.scannedBookID).get()
      .then(doc=>{
        var book=doc.data();
        if(book.Availability){
          this.initiateBookIssue();
          transactionMessage="Book Issued";
        }else{
          this.initiateBookReturn();
          transactionMessage="Book Returned";
        }
      })
      this.setState({
        transactionMessage:transactionMessage,
      })
    }
    initiateBookIssue=async()=>{
      db.collection("TransactionHistory").add({
        studentId:this.state.scannedStudentID,
        bookId:this.state.scannedBookID,
        date:firebase.firestore.TimeStamp.now().toDate(),
        transactionType:"issue"
      })
      db.collection("Books").doc(this.state.scannedBookID).update({
        Availability:false,
      })
      db.collection("Students").doc(this.state.scannedStudentID).update({
        Borrowing:firebase.firestore.FieldValue.increment(1),
      })
      alert("Book Issued");
      this.setState({
        scannedBookID:"",
        scannedStudentID:"",
      })
    }
    initiateBookReturn=async()=>{
      db.collection("TransactionHistory").add({
        studentId:this.state.scannedStudentID,
        bookId:this.state.scannedBookID,
        date:firebase.firestore.TimeStamp.now().toDate(),
        transactionType:"return"
      })
      db.collection("Books").doc(this.state.scannedBookID).update({
        Availability:true,
      })
      db.collection("Students").doc(this.state.scannedStudentID).update({
        Borrowing:firebase.firestore.FieldValue.increment(-1),
      })
      alert("Book Returned");
      this.setState({
        scannedBookID:"",
        scannedStudentID:"",
      })
    }
  render() {
    const hasCameraPermissions=this.state.hasCameraPermissions;
    const hasScanned=this.state.scanned;
    const buttonState=this.state.buttonState;
    if(buttonState!=='normal'&& hasCameraPermissions){
      return(<BarCodeScanner onBarCodeScanned={hasScanned?undefined:this.handleBarCodeScan}></BarCodeScanner>)
    }
    else if(buttonState==='normal'){
      return (
        <View style={styles.container}>
          <View>
            <Image style={{width:200,height:200}} source={require('../pictureassets/assets/booklogo.jpg')}></Image>
            <Text style={{textAlign:'center',fontSize:20}}>Library App</Text>
          </View>
          <View style={styles.inputView}>
            <TextInput style={styles.inputBox} placeholder="Book ID" value={this.state.scannedBookID}></TextInput>
            <TouchableOpacity style={styles.scanButton} onPress={()=>{
              this.getCameraPermissions("BookID")
            }}><Text style={styles.buttonText}>Scan</Text></TouchableOpacity>
          </View>
          <View style={styles.inputView}>
            <TextInput style={styles.inputBox} placeholder="Student ID" value={this.state.scannedStudentID}></TextInput>
            <TouchableOpacity style={styles.scanButton} onPress={()=>{
              this.getCameraPermissions("StudentID")
            }}><Text style={styles.buttonText}>Scan</Text></TouchableOpacity>
          </View>
          <Text>{hasCameraPermissions===true?this.state.scannedData:'PLS GIVE PERMISSIONS'}</Text>
        <TouchableOpacity style={styles.scanButton} onPress = {this.getCameraPermissions()}><Text>Scan Book</Text></TouchableOpacity>
        </View>
      );
    }
    }
  }
  const styles=StyleSheet.create({
    container:{
      flex:1,
      justifyContent:'center',
      alignItems:'center',
    },
    scanButton:{
      backgroundColor:'blue',
      padding:5,
      margin:5,
    },
    inputView:{ flexDirection: 'row', margin: 20 }, inputBox:{ width: 200, height: 40, borderWidth: 1.5, borderRightWidth: 0, fontSize: 20 }, scanButton:{ backgroundColor: '#66BB6A', width: 50, borderWidth: 1.5, borderLeftWidth: 0 },
    buttonText:{ fontSize: 15, textAlign: 'center', marginTop: 10 },
  })