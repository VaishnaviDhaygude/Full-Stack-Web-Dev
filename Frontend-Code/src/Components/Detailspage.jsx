import React, { Component } from 'react';
import Navbar from './Nav-bar';
import './Styles/detailsPage.css';
import queryString from 'query-string';
import axios from 'axios';
import Modal from 'react-modal';
import "react-responsive-carousel/lib/styles/carousel.min.css"; 
import { Carousel } from 'react-responsive-carousel';
import StripeCheckout from 'react-stripe-checkout';



const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'black'
    }
};
const menuStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#fff',
        padding: '5px'
    }
};


class Detailspage extends Component {
    constructor() {
        super();
        this.state = {
            content_value: 1,
            restaurant: "",
            galleryModalIsOpen: false,
            menuModalIsOpen: false,
            menuItems: [],
            restaurant_id: undefined,
            shouldLogin: false,
            subTotal: 0,
            handleAlert: false,
            paymentForm: false,
            isPaymentSuccess: false,
            oldCartRestaurant: '',
            cartQty: 0,
            cartMenuitems: [],
            orderMenuItems: [],
        }
    }
    componentDidMount = async () => {
     
        const qs = queryString.parse(this.props.location.search);
        const restaurant_id = qs.restaurant;
        const open = qs.open;


        let cartQty = localStorage.getItem('cartQty');
        if (cartQty) {
            this.setState({ cartQty })
        } else {
            this.setState({ cartQty: 0 });
        }

     
        if (open && localStorage.getItem('cartValue')) {
            this.setState({ menuModalIsOpen: true });
        }

        const result = await axios({
            method: "GET",
            url: `http://localhost:8900/restaurants/${restaurant_id}`,
            headers: { 'Content-Type': 'application/json' }
        })
        this.setState({ restaurant: result.data, restaurant_id });

      
        let cart_value = localStorage.getItem('cartValue');
        cart_value = JSON.parse(cart_value);
        if (cart_value) {
            if (cart_value.restaurant.name === this.state.restaurant.name) {
                this.setState({ menuItems: cart_value.menuItems, subTotal: cart_value.subTotal });
            }
        }
    }
  
    openOverview = () => {
        this.setState({ content_value: 1 });
    }
    openContact = () => {
        this.setState({ content_value: 2 });
    }

 
    handleGalleryModal = () => {
        this.setState({ galleryModalIsOpen: true });
    }
    closeModal = () => {
        this.setState({ galleryModalIsOpen: false });
    }

    handleMenuModal = async () => {
        const { restaurant_id } = this.state;
        this.setState({ menuModalIsOpen: true });

        const result = await axios({
            method: 'GET',
            url: `http://localhost:8900/getmenu/${restaurant_id}`,
            headers: { 'Content-Type': 'application/json' }
        });

     
        let localValue = localStorage.getItem('cartValue')
        localValue = JSON.parse(localValue);
        if (!localValue || this.state.restaurant.name != localValue.restaurant.name) {
            this.setState({ menuItems: result.data[0].menu_items });
        } else {
            localStorage.removeItem('cartValue');
        }
    }


    closeMenuModal = () => {
   
        const orderedItems = this.state.menuItems.filter((item) => item.qty != 0);
        let cart_value = localStorage.getItem('cartValue');
        cart_value = JSON.parse(cart_value);

        if (orderedItems && this.state.subTotal > 0) {
            localStorage.setItem('cartValue', JSON.stringify(this.state));
        } else if (cart_value && this.state.restaurant.name === cart_value.restaurant.name) {
            localStorage.removeItem('cartValue');
        }

        this.setState({ menuModalIsOpen: false });

        localStorage.setItem('cartQty', this.state.cartQty);
    }
 
    handlePayButton = () => {
        const orderedItems = this.state.menuItems.filter((item) => item.qty != 0);
        if (orderedItems && this.state.subTotal > 0) {
            localStorage.setItem('cartValue', JSON.stringify(this.state));
        }
        const loginData = localStorage.getItem('loginData');
        if (loginData) {
            this.setState({ paymentForm: true, orderMenuItems: orderedItems });
        } else {
            localStorage.setItem('shouldLogin', true);
            this.setState({ shouldLogin: true, menuModalIsOpen: false });
        }
        localStorage.setItem('cartQty', this.state.cartQty);
    }
  
    handleAdd = (index, operation_type) => {
        let cart_value = localStorage.getItem('cartValue');
        cart_value = JSON.parse(cart_value);
       
        if (cart_value && this.state.restaurant.name != cart_value.restaurant.name) {
            const filterValue = cart_value.menuItems.filter(item => item.qty !== 0);
            this.setState({ handleAlert: true, oldCartRestaurant: cart_value.restaurant, cartMenuitems: filterValue });
        } else {
            let total = 0;
            const { menuItems } = this.state;
            let items = [...menuItems];
            let item = items[index];

            if (operation_type === "add") {
                item.qty = item.qty + 1;
            }
            if (operation_type === "subtract") {
                item.qty = item.qty - 1;
            }
            items[index] = item;
            items.map((item) => {
                total += item.qty * item.price;
            })
      
            const filterData = items.filter((item) => item.qty != 0);
            let cartQty = filterData.map(item => 1 * item.qty);
            cartQty = cartQty.length > 0 ? cartQty.reduce((a, b) => a + b) : 0;
            this.setState({ menuItems: items, subTotal: total, cartQty });
        }
    }

    closehandleAlert = () => {
        this.setState({ handleAlert: false });
    }
  
    clearCart = () => {
        localStorage.removeItem('cartValue');
        localStorage.removeItem('cartQty');
        this.setState({ handleAlert: false, cartQty: 0 });
    }
  
    goToCart = () => {
        this.props.history.push(`/details?restaurant=${this.state.oldCartRestaurant._id}&open=${true}`);
        window.location.reload();
    }
 
    closePaymentForm = () => {
        this.setState({ paymentForm: false });
    }
   
    makePayment = (token) => {
        this.setState({ loading: true });
        const { subTotal } = this.state;
        const productList = this.state.menuItems.filter((item) => item.price !== 0);
        const product = productList.map(item => item.name);
        const body = {
            token,
            product,
            subTotal
        };
        const headers = {
            "Content-Type": "application/json"
        };
      
        return fetch(`http://localhost:8900/payment`, {
            method: "POST",
            headers,
            body: JSON.stringify(body)
        })
            .then(response => {
                console.log("RESPONSE ", response);
                const { status } = response;
                console.log("STATUS ", status);
          
                const address = {
                    name: token.card.name,
                    address_line: token.card.address_line1,
                    city: token.card.address_city
                }
            
                var d = new Date();
                const date = d.toString();

                localStorage.removeItem('cartValue');
                localStorage.removeItem('cartQty');
           
                localStorage.setItem('orderData', JSON.stringify(this.state.orderMenuItems));
                localStorage.setItem('restaurant', JSON.stringify(this.state.restaurant));
                localStorage.setItem('subTotal', this.state.subTotal);
                localStorage.setItem('address', JSON.stringify(address));
                localStorage.setItem('date', date);
                this.setState({ cartQty: 0, isPaymentSuccess: true, paymentForm: false, menuModalIsOpen: false, subTotal: 0 });
            })
            .catch(error => console.log(error));
    };
    
    closePaymentSuccess = () => {
        this.setState({ isPaymentSuccess: false });
    }

    render() {
        const { restaurant, galleryModalIsOpen, menuModalIsOpen, menuItems, shouldLogin, subTotal, cartQty } = this.state;

        return (
            <div>
                <Navbar value={shouldLogin} cartQty={cartQty} />
             
                <div className="container" style={{}}>
                    <img src={restaurant.thumb} className="detail-img" alt="restaurant-image" width="100%" height="352px" style={{ marginTop: "50px" }} />
                    <button className="gallery" onClick={this.handleGalleryModal}>Click to see Image Gallery</button>
                    <div className="restaurant">{restaurant.name}</div>
                    <button className="order" onClick={this.handleMenuModal}>Place Online Order</button>


                    <div className="btn">
                        <button className="btn-1" style={this.state.content_value == 1 ? { color: '#ce0505' } : { color: 'black' }} onClick={this.openOverview}>Overview</button>
                        <button className="btn-2" style={this.state.content_value == 2 ? { color: '#ce0505' } : { color: 'black' }} onClick={this.openContact}>Contact</button>
                    </div>
                    <div className="path"></div>
                    <div id="content1" className="content" style={this.state.content_value === 1 ? { display: 'block' } : { display: 'none' }}>
                        <div className="restaurant2" style={{ marginTop: '20px', marginBottom: '30px' }}>About this place</div>
                        <div className="cuisine-detail">Cuisine</div>
                        <div className="address" style={{ marginBottom: '30px' }}>{restaurant.cuisine_id ? restaurant.cuisine_id.map(item => `${item.name} `) : null}</div>
                        <div className="cuisine-detail">Average Cost</div>
                        <div className="address" style={{ marginBottom: '0px' }}>₹{restaurant.cost} for two people (approx)</div>
                    </div>
                    <div id="content2" className="content" style={this.state.content_value === 2 ? { display: 'block' } : { display: 'none' }}>
                        <div className="phone-number" style={{ marginTop: '30px' }}>Phone Number</div>
                        <div className="number" style={{ marginBottom: '30px' }}>{restaurant.contact_number}</div>
                        <div className="restaurant2">{restaurant.name}</div>
                        <div className="address" style={{ marginBottom: '50px' }}>{restaurant.address}</div>
                    </div>

                    <Modal
                        isOpen={galleryModalIsOpen}
                        style={customStyles}
                    >
                        <button className="carousel-closebutton" style={{ float: 'right', borderRadius: '50%' }} onClick={this.closeModal}><span style={{ padding: '7px' }} className="glyphicon glyphicon-remove"></span></button>
                        <div>
                            <Carousel showThumbs={false}>
                                <div>
                                    <img src="assets/breakfast.png" className="carousel-image" />
                                </div>
                                <div>
                                    <img src="assets/lunch.png" className="carousel-image" />
                                </div>
                                <div>
                                    <img src="assets/dinner.png" className="carousel-image" />
                                </div>
                                <div>
                                    <img src="assets/snacks.png" className="carousel-image" />
                                </div>
                                <div>
                                    <img src="assets/drinks.png" className="carousel-image" />
                                </div>
                                <div>
                                    <img src="assets/nightlife.png" className="carousel-image" />
                                </div>
                            </Carousel>
                        </div>
                    </Modal>

                  
                    <Modal
                        isOpen={menuModalIsOpen}
                        style={menuStyles}
                    >
                        <button className="carousel-button" onClick={this.closeMenuModal}><span style={{ padding: '7px' }} className="glyphicon glyphicon-remove"></span></button>
                        <div className="menu">

                            <div className="container">
                                <div className="restaurant-title">{restaurant.name}</div>
                                {menuItems.map((item, index) => {
                                    return <div>
                                        <div className="green-rectangle">
                                            <div className="green-dot"></div>
                                        </div>
                                        <div style={{ display: 'inline-block' }}>
                                            <div className="Gobi-Manchurian">{item.name}</div>
                                            <div className="menu-price">₹{item.price}</div>
                                            <div className="menu-content">{item.description}</div>
                                        </div>
                                        <div style={{ display: 'inline-block', verticalAlign: 'top' }}>
                                            <img src={item.image_url} alt="" height="92" width="92" style={{ borderRadius: '10px' }} />
                                            {item.qty === 0 ? <div className="add-button" onClick={() => this.handleAdd(index, "add")}>Add</div> :
                                                <div style={{ textAlign: 'center' }}>
                                                    <span style={{ fontSize: '15px', color: 'grey', fontWeight: '600', marginRight: '10px', cursor: 'pointer' }} onClick={() => this.handleAdd(index, "subtract")}>-</span>
                                                    <span style={{ fontSize: '15px', color: '#61b246', fontWeight: '600', marginRight: '10px' }}>{item.qty}</span>
                                                    <span style={{ fontSize: '15px', color: '#61b246', fontWeight: '600', marginRight: '10px', cursor: 'pointer' }} onClick={() => this.handleAdd(index, "add")}>+</span>
                                                </div>}
                                        </div>
                                        <div style={index === menuItems.length - 1 ? { display: 'none' } : { display: 'block' }} className="Path-6229"></div>
                                    </div>
                                })}
                            </div>
                            <div className="local">
                                <span className="Subtotal">Subtotal</span>
                                <span className="Subtotal-price">₹{subTotal}</span>
                                <span className="local-1" onClick={this.handlePayButton}>Continue</span>
                            </div>
                        </div>

                    </Modal>

                   
                    <Modal
                        isOpen={this.state.handleAlert}
                        style={menuStyles}>
                        <div style={{ padding: '10px 0px' }}>
                            <button className="carousel-button" onClick={this.closehandleAlert}><span style={{ padding: '7px' }} className="glyphicon glyphicon-remove"></span></button>
                            <h1>Clear your cart?</h1>
                            <hr />
                            <div style={{ fontSize: '14px' }}>Your cart has existing items from <strong>{this.state.oldCartRestaurant.name}</strong>. Do you want to clear it and add items from <strong>{this.state.restaurant.name}</strong>?</div>
                            <div style={{ margin: '10px 0' }}>
                                <div style={{ padding: '10px' }}>
                                    <div style={{ fontSize: '24px', fontWeight: '600px', color: '#192f60' }}>{this.state.oldCartRestaurant.name}</div>
                                    <div style={{ fontSize: '14px' }}>{this.state.oldCartRestaurant.locality}, {this.state.oldCartRestaurant.city_name}</div>
                                </div>
                                <hr />
                                {this.state.cartMenuitems.map((item) => {
                                    return <div>
                                        <img src={item.image_url} alt="" height="50" width="50" style={{ borderRadius: '10px', margin: '10px' }} />
                                        <span style={{ fontSize: '14px' }}>{item.qty} &#215; {item.name}</span>
                                        <span style={{ fontSize: '14px', float: 'right', marginTop: '25px' }}>₹{item.price * item.qty}</span>
                                        <hr style={{ margin: '0' }} />
                                    </div>
                                })}
                            </div>
                            <div style={{ float: 'right' }}>
                                <button style={{ padding: '10px 20px', border: 'none', background: '#ce0505', color: '#fff', fontSize: '14px', borderRadius: '10px', margin: '10px' }} onClick={this.clearCart}>Clear cart</button>
                                <button style={{ padding: '10px 20px', border: '1px solid #ce0505', background: 'transparent', fontSize: '14px', color: '#ce0505', borderRadius: '10px' }} onClick={this.goToCart}>Proceed with these items</button>
                            </div>

                        </div>
                    </Modal>
                 
                    <Modal
                        isOpen={this.state.paymentForm}
                        style={menuStyles}>
                        <button className="carousel-button" onClick={this.closePaymentForm}><span style={{ padding: '7px' }} className="glyphicon glyphicon-remove"></span></button>
                        {this.state.subTotal > 0 ? <div style={{ width: '400px' }}>
                            <h1 style={{ margin: '10px' }}>Order Summary</h1>
                            <div style={{ height: '350px' }}>
                                <div style={{ padding: '10px', background: 'rgb(248, 248, 248)' }}>
                                    <div style={{ fontSize: '24px', fontWeight: '600px', color: '#192f60' }}>{restaurant.name}</div>
                                    <div style={{ fontSize: '14px' }}>{restaurant.locality}, {restaurant.city_name}</div>
                                </div>

                                {this.state.orderMenuItems.map((item) => {
                                    return <div>
                                        <img src={item.image_url} alt="" height="50" width="50" style={{ borderRadius: '10px', margin: '10px' }} />
                                        <span style={{ fontSize: '12px' }}>{item.qty} &#215; {item.name}</span>
                                        <span style={{ fontSize: '12px', margin: '25px 10px 0 0px', float: 'right' }}>₹{item.qty * item.price}</span>
                                        <hr style={{ margin: '0' }} />
                                    </div>
                                })}
                                <div style={{ padding: '10px' }}>
                                    <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Grandtotal</span>
                                    <span style={{ fontSize: '18px', float: 'right', fontWeight: 'bold' }}>₹{this.state.subTotal}</span>
                                </div>
                                <hr />
                            </div>

                            <div className="payment-footer">
                                <StripeCheckout
                                    stripeKey="pk_test_51OlROUSB0sIYxOzDvYYteJm6iMnIFkCQAiMe2wO6w9s0vXEQzAAcpXO4vr2ZIVRsXpiU0NyDqrEaXH1e1ox4eMaq00Fe5R8WH0"
                                    token={this.makePayment}
                                    name={restaurant.name}
                                    amount={this.state.subTotal * 100}
                                    currency="INR"
                                    image={restaurant.thumb}
                                    shippingAddress
                                    billingAddress
                                    alipay
                                    bitcoin
                                >
                                    <button className="payment-button">Proceed</button>
                                </StripeCheckout>
                            </div> </div> : <div style={{ padding: '10px', color: 'orange', width: '300px', fontSize: '16px', fontWeight: 'bold' }}>Please select the items!!!</div>}
                    </Modal>

                   
                    <Modal
                        isOpen={this.state.isPaymentSuccess}
                        style={menuStyles}>
                        <div style={{ padding: '10px 40px' }}>
                            <button className="carousel-button" onClick={this.closePaymentSuccess}><span style={{ margin: '10px' }} className="glyphicon glyphicon-remove"></span></button>
                            <img src="http://www.shikharclasses.in/wp-content/uploads/2020/04/PAYMENT-SUCCESS.png" alt="" width="100%" />
                        </div>
                    </Modal>


                </div>
            </div>
        )
    }
}

export default Detailspage;