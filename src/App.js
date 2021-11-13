import './App.css';
import React from 'react'; 
const SteinStore = require("stein-js-client");
var _ = require('lodash');

class App extends React.Component {
  constructor(props) {
    super(props);
    this.store = new SteinStore(
      "https://api.steinhq.com/v1/storages/618d988dc582292380b45370"
    );
    this.state = {
      wishes: []
    }; 
    this.getData();
  }
  
  async getData() {
    await this.store.read("Wishes").then(data => {
      this.setState({
        wishes: data.map(data => ({
          id: parseInt(data.ID),
          name: data.ITEM,
          dsp: parseInt(data.DISPONIVEL),
          qty: parseInt(data.QUANTIDADE),
          cod: JSON.parse(data.COD),
          status: Boolean(parseInt(data.STATUS)),
          img: data.IMG
        }))
      });
      console.log(this.state);
    });
  }
  
  async updateWish(wishId, status, res, dsp) {
    await this.store.edit("Wishes", {
      search: { ID: wishId.toString() },
      set: { STATUS: parseInt(status), COD: JSON.stringify(res), DISPONIVEL: dsp}
    })
      .then(res => {
      console.log(res);
    });
  }
  
  arrayRemove(arr, value) { 
    return arr.filter(function(ele){ 
      return ele !== value; 
    });
  }
  
  addWish(wishId) {
    let newState = Object.assign({}, this.state)
    let wish = _.find(newState.wishes, {id: wishId});
    if (wish.status) {
      let res = window.prompt("Digite um código de segurança caso queira cancelar a reserva depois:", "");
      if (res) {
        if (wish.dsp === 1) {
          wish.status = !wish.status
        }
        wish.dsp -= 1
        wish.cod.push(parseInt(res))
        this.setState(newState)
        this.updateWish(parseInt(wishId), wish.status ? 1 : 0, wish.cod, wish.dsp)
      } else if (res === "") {
        window.alert("Precisa digitar um código válido!");
      }
    } else {
      let res = window.prompt("Digite um código de segurança para cancelar a reserva:", "");
      if (res && wish.cod.includes(parseInt(res))) {
        wish.status = !wish.status
        wish.dsp += 1
        wish.cod = this.arrayRemove(wish.cod, parseInt(res))
        this.setState(newState)
        this.updateWish(parseInt(wishId), wish.status ? 1 : 0, wish.cod, wish.dsp)
      } else {
        window.alert("Codigo inválido!");
      }
      // this.store.read("Wishes", { search: { ID: wishId } }).then(data => {
      //   if (data && data.length != 0) {
      //     wish.status = !wish.status
      //     wish.dsp += 1
      //     this.setState(newState)
      //     this.updateWish(parseInt(wishId), wish.status ? 1 : 0, "", wish.dsp)
      //   } else {
      //     window.alert("Codigo inválido!");
      //   }
      // });
    }
  }
  
  removeWish(wishId) {
    let newState = Object.assign({}, this.state)
    let wish = _.find(newState.wishes, {id: wishId});
    let res = window.prompt("Digite um código de segurança para cancelar a reserva:", "");
    if (res && wish.cod.includes(parseInt(res))) {
      wish.dsp += 1
      wish.cod = this.arrayRemove(wish.cod, parseInt(res))
      this.setState(newState)
      this.updateWish(parseInt(wishId), wish.status ? 1 : 0, wish.cod, wish.dsp)
    } else {
      window.alert("Codigo inválido!");
    }
    // this.store.read("Wishes", { search: { COD: res } }).then(data => {
    //   if (data && data.length != 0) {
    //     wish.dsp += 1
    //     this.setState(newState)
    //     this.updateWish(parseInt(wishId), wish.status ? 1 : 0, "", wish.dsp)
    //   } else {
    //     window.alert("Codigo inválido!");
    //   }
    // });
  }
  
  render() {
    return (<SingleWish wishes={this.state.wishes} addWish={(wishId) => this.addWish(wishId)} removeWish={(wishId) => this.removeWish(wishId)} />);
  }  
}

class SingleWish extends React.Component  {
  render() {  
    const listItem = this.props.wishes.map((wish) => {
      return (
        <li className={!(wish.status && wish.dsp > 0) ? 'card active' : 'card notactive'} key={wish.id}>
          {(wish.status && wish.dsp > 0) ? '' : <div className="card-warn"><span>RESERVADO</span></div>}
          <span className="absolute-qtd">{wish.dsp} disponivel</span>
          <img className="card-img" src={wish.img} alt=""/>
          <div className="div-name">
            <span className="card-name">{wish.name}</span>
          </div>
          {(wish.dsp < wish.qty && wish.dsp !== 0) ? <button className="new-button" onClick={() => this.props.removeWish(wish.id)}>REMOVER RESERVA</button> : ''}
          <button onClick={() => this.props.addWish(wish.id)}>{(wish.status && wish.dsp > 0) ? 'RESERVAR' : 'REMOVER RESERVA'}</button>
        </li>
      );
    })
    
    return (
      <div className="container">
        <ul className="wish-list">
          { listItem }
        </ul>
      </div>
      );
  }
}

export default App;
