import React, { Component } from "react";
import { withRouter } from 'react-router-dom';
import "./Styles/Home.css";


class QuickSerch extends Component {

 
  handleClick = (id, name) => {
   
    const location_id = sessionStorage.getItem('location_id');
   
    if (location_id) {
      this.props.history.push(`/filter?mealtype=${id}&mealtype_name=${name}&location=${location_id}`);
    } else {
      this.props.history.push(`/filter?mealtype=${id}&mealtype_name=${name}`);
    }

  }
  render() {
    
    const { quicksearch } = this.props;
    return (
      <div>
        <div className="container">
          
          <div className="Quick">Quick Searches</div>
          <div className="discover">Discover restaurants by type of meal</div>

          <div className="row " style={{ marginTop: "30px" }}>
            {quicksearch.map((item) => {
              return (
                <div className="col-lg-4 col-md-6 col-sm-12  " onClick={() => this.handleClick(item.mealtype_id, item.name)}>
                  <div className="mealtype-image d-flex m-auto">
                    <img
                      className="home-img"
                      src={item.image}
                      alt="breakfast"
                      height="140px"
                      width="60%"
                    />
                   <div className="title">
                   <div className="mealtype-heading ">{item.name}</div>
                    <div className="mealtype-content ">{item.content}</div>
                   </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}


export default withRouter(QuickSerch);
