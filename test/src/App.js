import React from 'react';
import {useRoutes, useRedirect, useQueryParams, useInterceptor, A} from '../../dist';

const products = {
	"1": "Rainbow Fish",
	"2": "Glass of Water",
	"3": "Plush Snake",
};

const Home = () => (
	<React.Fragment>
		<h3>Welcome</h3>
		<p>
			This is a testing app for the hookrouter module.
		</p>
	</React.Fragment>
);
const About = () => (
	<React.Fragment>
		<h3>About this App</h3>
		<p>
			Its really just for testing purposes.
		</p>
	</React.Fragment>
);
const LockIn = () => {
	const stopInterception = useInterceptor((currentPath, nextPath) => {
		console.log(currentPath, nextPath);
		return currentPath;
	});

	return (
		<React.Fragment>
			<h3>Oh dear.</h3>
			<p>
				You are not allowed to leave this page.
			</p>
			<p>
				<button onClick={stopInterception}>Release me!</button>
			</p>
		</React.Fragment>
	);
};
const Products = () => {
	const [queryParams, setQueryParams] = useQueryParams();

	const {
		sort = 'asc'
	} = queryParams;

	return (
		<React.Fragment>
			<h3>Product overview</h3>
			<button onClick={() => setQueryParams({sort: sort === 'asc' ? 'desc' : 'asc'})}>
				Sort {sort === 'asc' ? 'Ascending' : 'Descending'}
			</button>
			<ul>
				{Object
					.entries(products)
					.sort(
						(a, b) => sort === 'asc'
							? a.title > b.title
								? 1
								: -1
							: a.title > b.title
								? -1
								: 1
					)
					.map(([id, title]) => <li key={id}><A href={`/product/${id}`}>{title}</A>
					</li>)}
			</ul>
		</React.Fragment>
	);
};

const Product = ({id}) => {

	return (
		<React.Fragment>
			<h3>Buy "{products[id]}" today</h3>
			<p>
				You won't regret it.
			</p>
			<ul>
				<li>Overview</li>
				<li>Ratings</li>
				<li>Buy Now</li>
			</ul>
		</React.Fragment>
	);
};

const routes = {
	'/welcome': () => <Home/>,
	'/about': () => <About/>,
	'/prison': () => <LockIn/>,
	'/product': () => <Products/>,
	'/product/:id*': ({id}) => <Product id={id}/>
};

const App = () => {
	useRedirect('/', '/welcome');
	const routeResult = useRoutes(routes);

	return (
		<React.Fragment>
			<h1>HookRouter test app</h1>
			<nav>
				<A href="/">Home</A><br/>
				<A href="/about">About</A><br/>
				<A href="/prison">Route with Lock-In</A><br />
				<A href="/product">Products</A>
			</nav>
			<main>
				{routeResult || '404 - Not found'}
			</main>
		</React.Fragment>
	);
};

export default App;
