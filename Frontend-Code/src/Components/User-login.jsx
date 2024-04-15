import React, { Component } from 'react';
import "./Styles/Filter.css";
import "./Styles/login.css";
import Modal from 'react-modal';
import GoogleLogin from 'react-google-login';
import FacebookLogin from 'react-facebook-login';
import { withRouter } from 'react-router-dom';
import axios from 'axios';

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        padding: '20px'
    }
};

class User extends Component {
    constructor(props) {
        super(props);
        this.state = {
            signinModalOpen: false,
            signupModalOpen: false,
            username: undefined,
            isLoggedin: false,
            imageUrl: undefined,
            email: undefined,
            password: undefined,
            confirmPassword: undefined,
            openCart: false,
            handleEmptyCart: false,
            cartMenuitems: [],
            oldCartRestaurant: '',
            cartSubtotal: undefined,
            openOrder: false,
            orderData: [],
            orderRestaurant: {},
            orderSubtotal: undefined,
            signupError: "",
            loading: false,
            userAddress: {},
            date: '',
        }
    }
    componentDidMount = () => {
        let valueOfLocal = localStorage.getItem('loginData');
        let shouldLogin = localStorage.getItem('shouldLogin');
        if (shouldLogin) {
            localStorage.removeItem('shouldLogin');
            this.handleSignin();
        }
        valueOfLocal = JSON.parse(valueOfLocal);
        if (valueOfLocal && valueOfLocal.username) {
            this.setState({ isLoggedin: true, username: valueOfLocal.username, imageUrl: valueOfLocal.imageUrl });
        }
    }
    handleSignin = () => {
        this.setState({ signinModalOpen: true });
    }
 
    closeModal = () => {
        this.setState({ signinModalOpen: false, signupError: "", loading: false });
    }
    handleSignup = () => {
        this.setState({ signupModalOpen: true });
    }
   
    closeSignupModal = () => {
        this.setState({ signupModalOpen: false, signupError: "", loading: false });
    }
  
    switchToSignup = () => {
        this.setState({ signinModalOpen: false, signupModalOpen: true, signupError: "", loading: false });
    }
  
    switchToSignin = () => {
        this.setState({ signupModalOpen: false, signinModalOpen: true, signupError: "", loading: false });
    }
 
    responseGoogle = (response) => {
        this.setState({ username: response.profileObj.name, imageUrl: response.profileObj.imageUrl, signinModalOpen: false, loading: true });
        localStorage.setItem('loginData', JSON.stringify(this.state));
        window.location.reload();
    }
  
    handleLogout = () => {
        localStorage.removeItem('loginData');
        window.location.reload();
    }
  
    responseFacebook = (response) => {
        this.setState({ username: response.name, imageUrl: response.picture.data.url, signinModalOpen: false });
        localStorage.setItem('loginData', JSON.stringify(this.state));
        window.location.reload();
    }
   
    handlesSignupFields = (event) => {
        let name = event.target.name;
        let value = event.target.value;
        this.setState({ [name]: value });
    }
    handleLoginFields = (event) => {
        let name = event.target.name;
        let value = event.target.value;
        this.setState({ [name]: value });
    }
  
    handleSignupForm = (event) => {
        event.preventDefault();
        const { password, confirmPassword } = this.state;
        let condition = true;
        if (password !== confirmPassword) {
            condition = false;
            this.setState({ signupError: 'Password doesn"t match!' });
        }
        var lowerCaseLetters = /[a-z]/g;
        var numbers = /[0-9]/g;
        if (!numbers.test(password) || !lowerCaseLetters.test(password)) {
            condition = false;
            this.setState({ signupError: "Password should contains letters and numbers" });
        }
        if (condition) {
            this.signupFormApiCall();
        }

    }

    signupFormApiCall = async () => {
        this.setState({ loading: true });
        const { username, email, password, confirmPassword } = this.state;

        const inputObj = {
            fullname: username,
            email: email,
            password: password
        }
        const result = await axios({
            method: 'POST',
            url: 'http://localhost:8900/signup',
            headers: { 'Content-Type': 'application/json' },
            data: inputObj
        })
        if (result.data === false) {
            this.setState({ signupError: "you are already logged in! Please Sign in!", loading: false });
        } else {
            localStorage.setItem('loginData', JSON.stringify(this.state));
            window.location.reload();
        }
    }

    handleLogin = async (event) => {
        event.preventDefault();
        const { email, password } = this.state;
        this.setState({ loading: true });

        const inputObj = {
            email: email,
            password: password
        }
        const result = await axios({
            method: 'POST',
            url: 'http://localhost:8900/login',
            headers: { 'Content-Type': 'application/json' },
            data: inputObj
        })
        if (result.data.length > 0) {
            this.setState({ username: result.data[0].fullname });
            localStorage.setItem('loginData', JSON.stringify(this.state));
            window.location.reload();
        } else {
            this.setState({ signupError: "Please provide a valid username and password.", loading: false });
        }
    }

    handleCart = () => {
        let cart_value = localStorage.getItem('cartValue');
        if (cart_value) {
            cart_value = JSON.parse(cart_value);
            const filterValue = cart_value.menuItems.filter(item => item.qty !== 0);
            this.setState({ openCart: true, cartMenuitems: filterValue, oldCartRestaurant: cart_value.restaurant, cartSubtotal: cart_value.subTotal });
        } else {
            this.setState({ handleEmptyCart: true });
        }
    }
   
    closeEmptyCart = () => {
        this.setState({ handleEmptyCart: false });
    }
   
    
    closeCart = () => {
        this.setState({ openCart: false });
    }

    clearCart = () => {
        localStorage.removeItem('cartValue');
        localStorage.removeItem('cartQty');
        window.location.reload();
    }

    goToCart = () => {
        let cart_value = localStorage.getItem('cartValue');
        cart_value = JSON.parse(cart_value);
        this.props.history.push(`/details?restaurant=${cart_value.restaurant._id}&open=${true}`);
        window.location.reload();
    }

    openOrderDetails = () => {
        let orderData = localStorage.getItem('orderData');
        orderData = JSON.parse(orderData);
        let orderRestaurant = localStorage.getItem('restaurant');
        orderRestaurant = JSON.parse(orderRestaurant);
        let userAddress = localStorage.getItem('address');
        userAddress = JSON.parse(userAddress);
        let orderSubtotal = localStorage.getItem('subTotal');
        let date = localStorage.getItem('date');
        this.setState({ openOrder: true, orderData, orderRestaurant, orderSubtotal, userAddress, date });
    }
   
    closeOrderDetails = () => {
        this.setState({ openOrder: false });
    }

    render() {
       
        const { signinModalOpen, signupModalOpen, isLoggedin, username, imageUrl, handleEmptyCart, openCart, cartMenuitems, loading } = this.state;
        let userDetails;
        let firstLetter;
        username ? firstLetter = username[0].toLowerCase() : firstLetter = undefined

        let { value, cartQty } = this.props;
        if (cartQty === undefined) {
            cartQty = localStorage.getItem('cartQty');
        }
        if (value === true) {
            this.componentDidMount();
        }

  
        if (isLoggedin && imageUrl) {
            userDetails = <div>
                <i className="fa fa-shopping-cart cart-icon" style={{ cursor: 'pointer' }} onClick={this.handleCart}></i>
                <span className="badge badge-primary cart-badge" style={{ color: '#fff', marginRight: '10px' }}>{cartQty ? cartQty : 0}</span>
                <img className="User-avatar" src={imageUrl} alt="" height="52" width="52" style={{ borderRadius: '50%' }} />
                <button className="signup" style={{ border: 'none' }}>{username}</button>
                <i className="glyphicon glyphicon-chevron-down" style={{ color: '#fff', cursor: 'pointer' }} data-toggle="collapse" data-target="#demo1"></i>
                <div id="demo1" className="collapse" style={{ background: '#ce0505', position: 'absolute', right: '7.5%' }}>
                    <button className="logout" style={{ margin: '0', color: '#fff', display: 'block' }} onClick={this.openOrderDetails}>Orders</button>
                    <button className="logout" style={{ color: '#fff', margin: '0' }} onClick={this.handleLogout}>Logout</button>
                </div>

            </div>
        }
        else if (imageUrl === undefined && isLoggedin) {
            userDetails = <div>
                <i className="fa fa-shopping-cart cart-icon" style={{ cursor: 'pointer' }} onClick={this.handleCart}></i>
                <span className="badge badge-primary cart-badge">{cartQty ? cartQty : 0}</span>
                <span className="firstletter-logo">{firstLetter}</span>
                <button className="signup" style={{ border: 'none' }}>{username}</button>
                <i className="glyphicon glyphicon-chevron-down" style={{ color: '#fff', cursor: 'pointer' }} data-toggle="collapse" data-target="#demo1"></i>
                <div id="demo1" className="collapse" style={{ background: '#ce0505', position: 'absolute', right: '7.5%' }}>
                    <button className="logout" style={{ margin: '0', color: '#fff', display: 'block' }} onClick={this.openOrderDetails}>Orders</button>
                    <button className="logout" style={{ color: '#fff', margin: '0' }} onClick={this.handleLogout}>Logout</button>
                </div>
            </div>
        }
       

        else {
            userDetails = <div>
                <i className="fa fa-shopping-cart cart-icon" style={{ cursor: 'pointer' }} onClick={this.handleCart}></i>
                <span className="badge badge-primary cart-badge">{cartQty ? cartQty : 0}</span>
                <button className="login" onClick={this.handleSignin} style={{ marginLeft: '0px' }}>Login</button>
                <button className="signup" onClick={this.handleSignup}>Create an account</button>

            </div>
        }
        return (
            <div>
              
                {userDetails}

         
                <Modal
                    isOpen={signinModalOpen}
                    style={customStyles}
                >

                    <div className="container-login">

                        <div className="wrap-login">
                            <button className="login-close" onClick={this.closeModal}><span className="fa fa-times"></span></button>

                            <span className="signin-with" style={{marginBottom: '20px'}}>Sign In With</span>

                            <div>
                               
                                <FacebookLogin
                                    appId="1906281989832303"
                                    fields="name,email,picture"
                                    callback={this.responseFacebook}
                                    textButton="Facebook"
                                    cssClass="btn-face"
                                    icon="fa-facebook-official"
                                />
                            </div>
                            <div>
                              
                                <GoogleLogin
                                    clientId="AIzaSyAB0Pb1mKYh3rTLh0PUMuf4DvFUlnhSz4k"
                                    render={renderProps => (
                                        <button className="google-auth-button" onClick={renderProps.onClick} disabled={renderProps.disabled}><img src="https://colorlib.com/etc/lf/Login_v5/images/icons/icon-google.png" />Google</button>
                                    )}
                                    buttonText="Login"
                                    onSuccess={this.responseGoogle}
                                    onFailure={this.responseGoogle}
                                    cookiePolicy={'single_host_origin'}
                                />
                            </div>
                   
                            <form className="login-form" onSubmit={this.handleLogin}>
                                <div style={{ color: 'red', textAlign: 'center', fontSize: '14px' }}>{loading ? null : this.state.signupError}</div>
                                <div class="wrap-input100 validate-input alert-validate" data-validate="Username is required">
                                    <input class="input100 form-control" type="email" name="email" placeholder="Email" onChange={this.handleLoginFields} required />
                                </div>
                                <div class="wrap-input100 validate-input alert-validate" data-validate="Username is required">
                                    <input class="input100 form-control" type="password" name="password" placeholder="password" onChange={this.handleLoginFields} required />
                                </div>
                                <div style={{ marginTop: '17px' }}>
                                    <button className="login-submit" disabled={loading}>{loading ? <i class="fa fa-refresh fa-spin"></i> : <i ></i>}Sign In</button>
                                </div>
                                <div style={{ marginTop: '17px', fontSize: '16px', textAlign: 'center' }}>Don't have an account? <a href="#" onClick={this.switchToSignup}>Sign up now</a></div>
                            </form>
                        </div>
                    </div>

                </Modal>

             
                <Modal
                    isOpen={signupModalOpen}
                    style={customStyles}
                >

                    <div className="container-login">

                        <div className="wrap-login">
                            <button className="login-close" onClick={this.closeSignupModal}><span className="fa fa-times"></span></button>
                            <form className="login-form" onSubmit={this.handleSignupForm}>

                                <div className="signin-with" style={{ justifyContent: 'normal' }}>Sign Up</div>
                                <div style={{ color: 'red', textAlign: 'center', fontSize: '14px' }}>{loading ? null : this.state.signupError}</div>

                                <div class="wrap-input100 validate-input alert-validate" data-validate="Username is required">
                                    <input class="input100 form-control" type="text" name="username" onChange={this.handlesSignupFields} placeholder="Full Name" required />
                                </div>
                                <div class="wrap-input100 validate-input alert-validate" data-validate="Username is required">
                                    <input class="input100 form-control" type="email" name="email" onChange={this.handlesSignupFields} placeholder="Email" required />
                                </div>
                                <div class="wrap-input100 validate-input alert-validate" data-validate="Username is required">
                                    <input class="input100 form-control" type="password" name="password" onChange={this.handlesSignupFields} placeholder="Password" minlength="8" required />
                                </div>
                                <div class="wrap-input100 validate-input alert-validate" data-validate="Username is required">
                                    <input class="input100 form-control" type="password" name="confirmPassword" onChange={this.handlesSignupFields} placeholder="Confirm Password" minlength="8" required />
                                </div>
                                <div style={{ marginTop: '17px' }}>
                                    <button type="submit" className="login-submit" disabled={loading}>{loading ? <i class="fa fa-refresh fa-spin"></i> : <i ></i>}Create account</button>
                                </div>
                                <div style={{ marginTop: '17px', fontSize: '16px', textAlign: 'center' }}>Already have an account? <a href="#" onClick={this.switchToSignin}>Sign in now</a></div>
                            </form>
                        </div>
                    </div>

                </Modal>

                <Modal
                    isOpen={handleEmptyCart}
                    style={customStyles}>
                    <button className="login-close" onClick={this.closeEmptyCart}><span className="fa fa-times" style={{ margin: '10px' }}></span></button>
                    <div style={{ fontSize: '36px', fontWeight: 'bold', textAlign: 'center', color: '#192f60' }}>Your cart is empty!!!</div>
                    <img src="https://d1nhio0ox7pgb.cloudfront.net/_img/g_collection_png/standard/512x512/shopping_cart.png" width="100%" height="300px" alt="" />
                </Modal>

          
                <Modal
                    isOpen={openCart}
                    style={customStyles}>
                    <button className="login-close" onClick={this.closeCart}><span className="fa fa-times" style={{ margin: '10px' }}></span></button>
                    <div style={{ fontSize: '30px', fontWeight: 'bold', color: '#192f60', margin: '10px' }}>My Cart</div>
                    <hr />
                    <div>
                        <div style={{ padding: '10px' }}>
                            <div style={{ fontSize: '24px', fontWeight: '600px', color: '#192f60' }}>{this.state.oldCartRestaurant.name}</div>
                            <div style={{ fontSize: '14px' }}>{this.state.oldCartRestaurant.locality}, {this.state.oldCartRestaurant.city_name}</div>
                        </div>
                        <hr />
                        {cartMenuitems.map((item) => {
                            return <div>
                                <img src={item.image_url} alt="" height="50" width="50" style={{ borderRadius: '10px', margin: '10px' }} />
                                <span style={{ fontSize: '12px' }}>{item.qty} &#215; {item.name}</span>
                                <span style={{ fontSize: '12px', float: 'right', margin: '20px 10px 0 30px' }}>₹{item.qty * item.price}</span>
                                <hr style={{ margin: '' }} />
                            </div>
                        })}
                        <div style={{ margin: '10px 0' }}>
                            <span style={{ fontSize: '18px', margin: '10px', fontWeight: 'bold' }}>Subtotal</span>
                            <span style={{ fontSize: '18px', float: 'right', marginRight: '10px', fontWeight: 'bold' }}>₹{this.state.cartSubtotal}</span>
                        </div>
                    </div>
                    <div style={{ textAlign: 'center', background: '#f5f5f5', padding: '10px' }}>
                        <button style={{ padding: '10px 20px', border: 'none', background: '#ce0505', color: '#fff', fontSize: '14px', borderRadius: '10px', margin: '10px' }} onClick={this.clearCart}>Clear cart</button>
                        <button style={{ padding: '10px 20px', border: '1px solid #ce0505', background: 'transparent', fontSize: '14px', color: '#ce0505', borderRadius: '10px' }} onClick={this.goToCart}>Proceed with these items</button>
                    </div>
                </Modal>
           
                <Modal
                    isOpen={this.state.openOrder}
                    style={customStyles}>
                    <button className="login-close" onClick={this.closeOrderDetails}><span className="fa fa-times" style={{ margin: '10px' }}></span></button>
                    {this.state.orderData ? <div style={{ width: '400px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#192f60', margin: '10px' }}>My Order Details</div>
                        <hr />
                        <div style={{ margin: '0 0 0 10px' }}>
                            <div style={{ display: 'inline-block' }}>
                                <p>Name:</p>
                                <p>Address:</p>
                                <p>City:</p>
                                <p>Time:</p>
                            </div>
                            <div style={{ display: 'inline-block', verticalAlign: 'top', marginLeft: '20px' }}>
                                <p>{this.state.userAddress.name}</p>
                                <p>{this.state.userAddress.address_line}</p>
                                <p>{this.state.userAddress.city}</p>
                                <p>{this.state.date}</p>
                            </div>

                        </div>
                        <hr />
                        <div style={{ padding: '10px' }}>
                            <div style={{ fontSize: '24px', fontWeight: '600px', color: '#192f60' }}>{this.state.orderRestaurant.name}</div>
                            <div style={{ fontSize: '14px' }}>{this.state.orderRestaurant.locality}, {this.state.orderRestaurant.city_name}</div>
                        </div>
                        <hr />
                        {this.state.orderData.map((item) => {
                            return <div>
                                <img src={item.image_url} alt="" height="50" width="50" style={{ borderRadius: '10px', margin: '10px' }} />
                                <span style={{ fontSize: '12px' }}>{item.qty} &#215; {item.name}</span>
                                <span style={{ fontSize: '12px', float: 'right', marginTop: '20px', marginRight: '10px' }}>₹{item.qty * item.price}</span>
                                <hr />
                            </div>
                        })}
                        <div style={{ padding: '10px', background: 'rgb(248, 248, 248)' }}>
                            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Grandtotal</span>
                            <span style={{ fontSize: '18px', float: 'right', fontWeight: 'bold' }}>₹{this.state.orderSubtotal}</span>
                        </div>


                    </div> : <div style={{ padding: '20px' }}><h1 style={{ marginBottom: '20px' }}>You don't have any orders!!!</h1>
                        <img src="https://orderem.com/images/Boostyoursalesandcustomapps.png" alt="" width="300px" height="300px" style={{ marginLeft: '40px' }} />
                        <h1 style={{ marginTop: '10px', textAlign: 'center' }}>Please Order Now!!!</h1>
                    </div>}
                </Modal>


            </div>
        )
    }
}

export default withRouter(User);