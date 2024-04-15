import React, { Component } from "react";
import "./Styles/Filter.css";
import queryString from 'query-string';
import axios from 'axios';
import Navbar from "./Nav-bar";

class Filter extends Component {
    constructor() {
        super();
        this.state = {
            restuarant: [],
            option: "",
            currentPage: 1,
            itemsPerPage: 2,
            mealtype_id: undefined,
            location_id: undefined,
            sort: 1,
            cuisine_id: [],
            lcost: undefined,
            hcost: undefined,
            location: []
        };
    }

    componentDidMount = async () => {
        const qs = queryString.parse(this.props.location.search);
        const location = qs.location;
        const mealtype = Number(qs.mealtype);
        const mealtype_name = qs.mealtype_name;

        this.setState({ option: mealtype_name });
        const inputObj = {
            location_id: location,
            mealtype_id: mealtype
        };

        const restuarant = await axios({
            method: 'POST',
            url: 'http://localhost:8900/filter',
            headers: { 'Content-Type': 'application/json' },
            data: inputObj
        });

        this.setState({ restuarant: restuarant.data, mealtype_id: mealtype, location_id: location });

        const locationDD = await axios({
            method: 'GET',
            url: 'http://localhost:8900/locations',
            headers: { 'Content-Type': 'application/json' }
        });

        this.setState({ location: locationDD.data });
    }

    handleSort = async (sort) => {
        const { mealtype_id, location_id, lcost, hcost, cuisine_id } = this.state;
        const inputObj = {
            sort: sort,
            mealtype_id: mealtype_id,
            location_id: location_id,
            lcost: lcost,
            hcost: hcost,
            cuisine_id: cuisine_id && cuisine_id.length > 0 ? cuisine_id : undefined
        };

        const restuarant = await axios({
            method: 'POST',
            url: 'http://localhost:8900/filter',
            headers: { 'Content-Type': 'application/json' },
            data: inputObj
        });

        this.setState({ restuarant: restuarant.data, sort, currentPage: 1 });
    }

    handleCost = async (lcost, hcost) => {
        const { sort, mealtype_id, location_id, cuisine_id } = this.state;
        const inputObj = {
            sort: sort,
            mealtype_id: mealtype_id,
            location_id: location_id,
            lcost: lcost,
            hcost: hcost,
            cuisine_id: cuisine_id && cuisine_id.length > 0 ? cuisine_id : undefined
        };

        const restuarant = await axios({
            method: 'POST',
            url: 'http://localhost:8900/filter',
            headers: { 'Content-Type': 'application/json' },
            data: inputObj
        });

        this.setState({ restuarant: restuarant.data, lcost, hcost, currentPage: 1 });
    }

    handleLocationChange = async (event) => {
        const location_id = event.target.value;
        const { sort, mealtype_id, lcost, hcost, cuisine_id } = this.state;

        const inputObj = {
            sort: sort,
            mealtype_id: mealtype_id,
            location_id: location_id === "Select Locations" ? undefined : location_id,
            lcost: lcost,
            hcost: hcost,
            cuisine_id: cuisine_id && cuisine_id.length > 0 ? cuisine_id : undefined
        };

        const restuarant = await axios({
            method: 'POST',
            url: 'http://localhost:8900/filter',
            headers: { 'Content-Type': 'application/json' },
            data: inputObj
        });

        this.setState({ restuarant: restuarant.data, location_id, currentPage: 1 });
    }

    handleCuisineChange = async (value) => {
        let tempArray = this.state.cuisine_id.slice();
        if (tempArray.indexOf(value) === -1) {
            tempArray.push(value);
        } else {
            tempArray.splice(tempArray.indexOf(value), 1);
        }

        const { sort, mealtype_id, location_id, lcost, hcost } = this.state;
        const inputObj = {
            sort: sort,
            mealtype_id: mealtype_id,
            location_id: location_id,
            lcost: lcost,
            hcost: hcost,
            cuisine_id: tempArray.length > 0 ? tempArray : undefined
        };

        const restuarant = await axios({
            method: 'POST',
            url: 'http://localhost:8900/filter',
            headers: { 'Content-Type': 'application/json' },
            data: inputObj
        });

        this.setState({ restuarant: restuarant.data, cuisine_id: tempArray, currentPage: 1 });
    }

    handleClickPage = (event) => {
        this.setState({ currentPage: Number(event.target.id) });
    }

    handlePrev = () => {
        this.setState({ currentPage: this.state.currentPage - 1 });
    }

    handleNext = () => {
        this.setState({ currentPage: this.state.currentPage + 1 });
    }

    handleViewRestaurant = (id) => {
        this.props.history.push(`/details?restaurant=${id}`);
    }

    render() {
        const { restuarant, currentPage, itemsPerPage } = this.state;
        const lastIndex = currentPage * itemsPerPage;
        const firstIndex = lastIndex - itemsPerPage;
        const currentRestuarant = restuarant.slice(firstIndex, lastIndex);

        let result = currentRestuarant && currentRestuarant.length > 0 ? currentRestuarant.map((item) => {
            return <div className="col-sm-12" onClick={() => this.handleViewRestaurant(item._id)} style={{ cursor: 'pointer' }}>
                <div className="restaurant-box" style={{ boxShadow: "0 3px 6px 0 rgba(0, 0, 0, 0.16)", margin: "0 0 20px 0" }}>
                    <div style={{ display: "inline-block" }}>
                        <img className="filter-image" src={item.thumb} width="120" height="120" alt="breakfast"
                            style={{ borderRadius: "25px", margin: "20px" }} />
                    </div>
                    <div style={{ display: "inline-block", verticalAlign: 'top', margin: '3rem 0 0 1rem' }} className="res-details">
                        <h2 style={{ fontWeight: "600", color: '#192f60' }}> {item.name} </h2>
                        <h4 style={{ fontWeight: "600", marginTop: "10px", color: '#192f60' }}>{item.locality}</h4>
                        <h5 style={{ width: "25rem", marginTop: "10px", color: '#636f88' }}>{item.address}</h5>
                    </div><br /><br />
                    <hr />
                    <div style={{ display: "inline-block", margin: "30px" }}>
                        <h4 className="h4-tag" style={{ color: '#636f88' }}>CUISINES:</h4>
                        <h4 className="h4-tag" style={{ color: '#636f88' }}>COST FOR TWO:</h4>
                    </div>
                    <div style={{ display: "inline-block", verticalAlign: "top", marginTop: "29px" }}>
                        <h4 className="h4-tag" style={{ color: '#192f60' }}>{item.cuisine_id.map((cuis) => cuis.name + " ")}</h4>
                        <h4 className="h4-tag" style={{ color: '#192f60' }}>₹{item.cost}</h4>
                    </div>
                </div>
            </div>;
        }) : <div style={{ fontSize: '30px', marginLeft: 'auto', marginRight: 'auto' }}>No results found ...</div>;

        const pageNumbers = [];
        for (let i = 1; i <= Math.ceil(restuarant.length / itemsPerPage); i++) {
            pageNumbers.push(i);
        }

        let prevButton;
        if (pageNumbers.length === 1) {
            prevButton = <li style={{ display: 'none' }}><a href="#" className="page-link" >Prev</a></li>;
        }
        if (pageNumbers.length > 1) {
            prevButton = <li className="page-list"><a href="#" className="page-numbers" onClick={this.handlePrev}>{`<`}</a></li>;
        }
        if (currentPage === 1 && pageNumbers.length > 1) {
            prevButton = <li className="page-list disabled"><a className="page-numbers" >{`<`}</a></li>;
        }

        let nextButton;
        if (pageNumbers.length === 1) {
            nextButton = <li style={{ display: 'none' }}><a href="#" className="page-link" >Next</a></li>;
        }
        if (pageNumbers.length > 1) {
            nextButton = <li className="page-list"><a href="#" className="page-numbers" onClick={this.handleNext}>{`>`}</a></li>;
        }
        if (currentPage === pageNumbers.length && pageNumbers.length > 1) {
            nextButton = <li className="page-list disabled"><a className="page-numbers">{`>`}</a></li>;
        }

        let renderPageNumbers = pageNumbers.map(number => {
            return (
                <li key={number} className="page-list">
                    <a className="page-numbers" style={currentPage === number ? { background: '#192f60', color: '#fff' } : {}} href="#" id={number} onClick={this.handleClickPage}>{number}</a>
                </li>
            );
        });

        return (
            <React.Fragment>
                <Navbar />
                <div className="container" style={{ marginTop: "2%" }}>
                    <h1 className="filter-heading" style={{ fontWeight: "bold", fontSize: "36px", margin: '0 0 20px 0', color: '#192f60' }}>{this.state.option} Places in New Delhi</h1>
                    <div className="row">
                        <div className="col-md-4">
                            <div className="panel panel-default" style={{ padding: '15px', marginBottom: '0px' }}>
                                <h4 style={{ fontWeight: "600", display: "inline-block" }}>Filters / Sort</h4>
                                <div style={{ display: "inline-block", verticalAlign: "top" }}
                                    className="glyphicon glyphicon-chevron-down toggle-div" data-toggle="collapse" data-target="#demo">
                                </div>
                            </div>
                            <div style={{ boxShadow: "0 3px 6px 0 rgba(0, 0, 0, 0.16)", height: "630px", padding: '17px 25px 31px 26px', marginBottom: "100px", background: "#fff" }} id="demo" className="collapse show" >
                                <h4 style={{ fontWeight: "600", fontSize: '18px', marginBottom: '20px' }}>Filters</h4>
                                <div style={{ fontSize: '14px' }}>Select location</div>
                                <div className="form-group">
                                    <select className="drop-down" onChange={this.handleLocationChange}>
                                        <option selcted>Selcect Locations</option>
                                        {this.state.location.map((item) => {
                                            return <option value={item.location_id}>{item.name}</option>;
                                        })}
                                    </select>
                                </div>
                                <div style={{ fontWeight: "normal", fontSize: '14px', marginTop: '30px', color: '#192f60' }}>Cuisine</div>
                                <div className="checkbox">
                                    <label><input type="checkbox" onChange={() => this.handleCuisineChange(1)} />North-Indian</label>
                                </div>
                                <div className="checkbox">
                                    <label><input type="checkbox" onChange={() => this.handleCuisineChange(2)} />South-Indian</label>
                                </div>
                                <div className="checkbox">
                                    <label><input type="checkbox" onChange={() => this.handleCuisineChange(3)} />Chinese</label>
                                </div>
                                <div className="checkbox">
                                    <label><input type="checkbox" onChange={() => this.handleCuisineChange(4)} />Fast Food</label>
                                </div>
                                <div className="checkbox">
                                    <label><input type="checkbox" onChange={() => this.handleCuisineChange(5)} />Street Food</label>
                                </div>
                                <div style={{ fontWeight: "normal", fontSize: '14px', marginTop: '30px', color: '#192f60' }}>Cost for two</div>
                                <div className="radio">
                                    <label><input type="radio" name="cost" onChange={() => this.handleCost(1, 500)} />Less than ₹500</label>
                                </div>
                                <div className="radio">
                                    <label><input type="radio" name="cost" onChange={() => this.handleCost(500, 1000)} />₹500 to ₹1000</label>
                                </div>
                                <div className="radio">
                                    <label><input type="radio" name="cost" onChange={() => this.handleCost(1000, 1500)} />₹1000 to ₹1500</label>
                                </div>
                                <div className="radio">
                                    <label><input type="radio" name="cost" onChange={() => this.handleCost(1500, 2000)} />₹1500 to ₹2000</label>
                                </div>
                                <div className="radio">
                                    <label><input type="radio" name="cost" onChange={() => this.handleCost(2000, 2500)} />₹2000+</label>
                                </div><br />
                                <div style={{ fontWeight: "600", fontSize: '14px', marginTop: '10px', color: '#192f60' }}>Sort</div>
                                <div className="radio">
                                    <label><input type="radio" name="sort" onChange={() => this.handleSort(1)} />Price low to high</label>
                                </div>
                                <div className="radio">
                                    <label><input type="radio" name="sort" onChange={() => this.handleSort(-1)} />Price high to low</label>
                                </div><br />
                            </div>
                        </div>
                        <div className="col-md-8">
                            <div className="row">
                                {result}
                                <div className="col-sm-12" >
                                    <ul className="pagination pagination-md page">
                                        {prevButton}
                                        {renderPageNumbers}
                                        {nextButton}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export default Filter;
