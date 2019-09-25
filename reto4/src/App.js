import React, { Component } from "react";
import uuid from 'uuid';
import './App.css';

import AWS from 'aws-sdk'
import Amplify, { Storage, API } from 'aws-amplify';
import awsconfig from './aws-exports';
import { withAuthenticator, S3Image } from 'aws-amplify-react';

AWS.config.correctClockSkew = true;
Amplify.configure(awsconfig);
Storage.configure({ level: 'private' });

class App extends Component {
  state = {
    arrayDoc: []
  }

  componentDidMount() {
    Storage.list('input/', {level: 'private'})
      .then(result => { 
        if(result) {
          //console.log("Result List1::: " + JSON.stringify(result));
          return result.filter(item => { return item.key != 'input/'; });
        }
      })
      .then(result => { 
        if(result) {
          //console.log("Result List2::: " + JSON.stringify(result));
          this.setState({arrayDoc: result});
        }
      })
      .catch(err => console.log(err));
  }

  putDocument = (evt) => {
    const file = evt.target.files[0];
    //console.log("Nuevo Nombre ::: " + uuid() + ".jpg");
    //const name = file.name;
    const name = uuid() + ".jpg"
    Storage.put('input/' + name, file)
      .then(result => {
        console.log("Result Put ::: " + JSON.stringify(result));
      //Trigger para búsqueda de información
      
      //Agregar a lista
      const arrayDoc = [...this.state.arrayDoc, result];
      this.setState({arrayDoc});
    })
  };

  updateDocument = (index, fileName, providerName, total) => {
    let apiName = "apic20dc1ad"; // replace this with your api name.
    let path = "/document"; //replace this with the path you have configured on your API
    let myInit = {
      body: {
        opt: 'update',
        userId: 'us-east-1:ad4eb8cc-2cdb-45eb-96c7-edf9ac37cf4d',
        fileName: fileName,
        providerName: providerName,
        total: total
      }, // replace this with attributes you need
      headers: {} // OPTIONAL
    };
    //userId, fileName, providerName, total, location, status

    API.post(apiName, path, myInit)
      .then(response => {
        // Add your code here
      })
      .catch(error => {
        console.log(error.response);
      });
  };

  render() {
    return (
      <div className="App">
        <p>Cargar Documento</p>
        <input type="file" onChange={this.putDocument} />
        <br /><br /><br />
        <div className="lst-doc">
          <ListInputDocument 
            arrayDoc={this.state.arrayDoc} 
            funcUpdateDoc={this.updateDocument}/>
        </div>
      </div>
    );
  };
}

const ListInputDocument = ({arrayDoc, funcUpdateDoc}) => {
  return (
    <div>
      {arrayDoc.map((value, index) => (
        <InputDocument 
          key = {index}
          compId = {index}
          compFile = {value.key}
          compProvider = {value.provider ? value.provider : ''}
          compTotal = {value.total ? value.total : ''}
          funcUpdateDoc = {funcUpdateDoc}/>
      ))}
    </div>
  );
}

const InputDocument = ({compId, compFile, compProvider, compTotal, funcUpdateDoc}) => {
  var refProviderName = React.createRef();
  var refTotal = React.createRef();

  return (<table><tbody><tr>
    <td className="td-doc-img">
      {compFile}<br />
      <S3Image id={'image' + compId} level="private" path="input/" imgKey={compFile}/>
    </td>
    <td>
      Proveedor: <br />
      <input id={'proveedor' + compId} type="text" 
          defaultValue={compProvider} ref={refProviderName} />
      <br /><br />
      Monto total: <br />
      <input id={'total' + compId}  type="text" 
          defaultValue={compTotal} ref={refTotal} />
      <br /><br />
      <input type="submit" value="Actualizar" 
        onClick={(event) => {
          event.preventDefault();
          funcUpdateDoc(compId, compFile, 
            refProviderName.current.value,
            refTotal.current.value);
        }} />
      <br /><br />
    </td>
  </tr></tbody></table>);
};

export default withAuthenticator(App, true);