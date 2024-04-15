import React, { Component } from 'react';
import Wallpaper from './Wallpaper';
import Quicksearch from './Quicksearch';
import axios from 'axios';



class Homepage extends Component {
    constructor(){
        super();
        this.state = {
            locations : [],
            mealtypes : [],
            restaurants : []
        }
    }

    
    componentDidMount = async() => {
        sessionStorage.clear();

        let location = await axios({
            method : 'GET',
            url : 'http://localhost:8900/locations',
            headers : {'content-type' : 'application/json'}
        });
     
        this.setState({locations : location.data});

   
        let mealtype = await axios({
            method : 'GET',
            url : 'http://localhost:8900/mealtypes',
            headers: {'content-type':'application/json'}
        });
      
        this.setState({mealtypes : mealtype.data});

        let restaurants = await axios({
            method: 'GET',
            url: 'http://localhost:8900/restaurants',
            headers: {'content-type':'application/json'}
        });
        this.setState({restaurants: restaurants.data});
    }

    render() { 
        const {locations, mealtypes, restaurants} = this.state;
        return ( <div>

            <Wallpaper ddlocations={locations} />
            <Quicksearch quicksearch={mealtypes} />
           
        </div> );
    }
}
 

export default Homepage;