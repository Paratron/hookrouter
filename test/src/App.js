import React from 'react';
import {
	useRoutes,
	useTitle,
	usePath,
	useRedirect,
	useQueryParams,
	useInterceptor,
	useControlledInterceptor,
	A,
	setLinkProps
} from '../../dist';
import QPTest from './QueryParamTest';

const products = {
	"1": "Rainbow Fish",
	"2": "Glass of Water",
	"3": "Plush Snake",
};

const Home = () => {
	useTitle('Home');
	return (
		<React.Fragment>
			<h3>Welcome</h3>
			<p>
				This is a testing app for the hookrouter module.
			</p>
		</React.Fragment>
	);
};
const About = () => {
	useTitle('About');
	return (
		<React.Fragment>
			<h3>About this App</h3>
			<p>
				Its really just for testing purposes.
			</p>
		</React.Fragment>
	);
};
const LockIn = () => {
	useTitle('Lock-In');
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

const TimeTrap = () => {
	const [nextPath, confirmNavigation] = useControlledInterceptor();

	React.useEffect(() => {
		if (!nextPath) {
			return;
		}
		console.log(nextPath);
		setTimeout(confirmNavigation, 1000);
	}, [nextPath]);

	return (
		<React.Fragment>
			<h3>Time trap</h3>
			<p>
				Navigate somewhere else. I will wait a second, before I let you go.
			</p>
		</React.Fragment>
	);
};

const Products = () => {
	useTitle('Products');
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
					// Note: the link uses the setLinkProps method, but you should prefer using
					// the hookrouter 'A' component if you are not using a framework that
					// requires href / onClick to be provided to it
					.map(([id, title]) => (
						<li key={id}><a {...setLinkProps({href: `/product/${id}`})}>{title}</a></li>
					))}
			</ul>
		</React.Fragment>
	);
};

const Product = ({id}) => {
	useTitle(`Product "${products[id]}"`);
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
	'/timeTrap': () => <TimeTrap/>,
	'/product': () => <Products/>,
	'/product/:id*': ({id}) => <Product id={id}/>,
	'/qpTest': () => <QPTest/>
};

const PathLabel = () => {
	const path = usePath();
	return <p>Current path: {path}</p>;
};

const SmartNotFound = () => {
	const path = usePath();
	return (
		<React.Fragment>
			<h3>404 - Not Found</h3>
			<p>Current path: {path}</p>
		</React.Fragment>
	);
};

const RouteContainer = () => {
	// We simulate passing a fresh routes object on every call, here.
	const routeResult = useRoutes(Object.assign({}, routes));
	return routeResult || <SmartNotFound />;
};

const App = () => {
	useRedirect('/', '/welcome');

	return (
		<React.Fragment>
			<h1>HookRouter test app</h1>
			<PathLabel/>
			<nav>
				<A href="/">Home</A><br/>
				<A href="/about">About</A><br/>
				<A href="/prison">Route with Lock-In</A><br/>
				<A href="/timeTrap">Route that defers navigation</A><br/>
				<A href="/product">Products</A><br/>
				<A href="/qpTest">Query Params Test</A><br />
				<A href="/nf1">This route does not exist</A><br />
				<A href="/nf2">This route does not exist as well</A>
			</nav>
			<main>
				<RouteContainer/>
			</main>
		</React.Fragment>
	);
};

export default App;
