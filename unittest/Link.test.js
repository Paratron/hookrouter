import React from 'react';
import renderer from 'react-test-renderer';
import {navigate, getBasepath} from "../src/router";
import {A, setLinkProps} from "../src";

// allow us to mock navigate and getBasepath
jest.mock("../src/router");

describe('Link.js', () => {

  describe('useLink', () => {

    test('throws error when href not supplied', () => {
      expect(() => setLinkProps()).toThrow();
      expect(() => setLinkProps({onClick: () => null})).toThrow();
    });

    test('provides onClick that performs navigation', () => {
      const {href, onClick} = setLinkProps({href: "test1"});

      expect(href).toBe("test1");
      expect(onClick).toBeInstanceOf(Function);

      const e = {
        preventDefault: jest.fn(),
        currentTarget: {
          href: "onClick1"
        }
      };

      onClick(e);

      expect(e.preventDefault).toHaveBeenCalledTimes(1);
      expect(navigate).toHaveBeenCalledWith("onClick1");
    });

    test('wraps onClick and triggers wrapped onClick with event', () => {
      const wrappedOnClick = jest.fn();
      const {href, onClick} = setLinkProps({href: "test2", onClick: wrappedOnClick});

      expect(href).toBe("test2");
      expect(onClick).toBeInstanceOf(Function);

      const e = {
        preventDefault: jest.fn(),
        currentTarget: {
          href: "onClick2"
        }
      };

      onClick(e);

      expect(e.preventDefault).toHaveBeenCalledTimes(1);
      expect(navigate).toHaveBeenCalledWith("onClick2");
      expect(wrappedOnClick).toHaveBeenCalledWith(e);
    });

    test('uses getBasepath() when href starts with /', () => {
      getBasepath.mockReturnValue("/test3");

      const {href, onClick} = setLinkProps({href: "/test-basepath"});

      expect(href).toBe("/test3/test-basepath");
      expect(onClick).toBeInstanceOf(Function);
    });

  });

  describe('A', () => {

    test('renders correctly with href', () => {
      getBasepath.mockReturnValue("");

      const tree = renderer
        .create(<A href="/Paratron/hookrouter">hookrouter</A>)
        .toJSON();

      expect(tree).toMatchSnapshot();
    });

    test('renders correctly with href and onClick', () => {
      getBasepath.mockReturnValue("");

      const tree = renderer
        .create(<A href="/Paratron/hookrouter" onClick={() => null}>hookrouter</A>)
        .toJSON();

      expect(tree).toMatchSnapshot();
    });

    test('renders correctly with href, onClick, and target', () => {
      getBasepath.mockReturnValue("");

      const tree = renderer
        .create(<A href="/Paratron/hookrouter" onClick={() => null} target="_blank">hookrouter</A>)
        .toJSON();

      expect(tree).toMatchSnapshot();
    });

    test('renders correctly with href, onClick, and target plus basepath', () => {
      getBasepath.mockReturnValue("/test4");

      const tree = renderer
        .create(<A href="/Paratron/hookrouter" onClick={() => null} target="_blank">hookrouter</A>)
        .toJSON();

      expect(tree).toMatchSnapshot();
    });

  });

});
