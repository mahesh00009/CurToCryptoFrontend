import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Container, Row, Col, Spinner } from 'react-bootstrap';
import './CryptoConverter.css'
import { currencies } from '../AllCurrencies';

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const CryptoConverter = () => {
  const [cryptocurrencies, setCryptocurrencies] = useState([]);
  const [amount, setAmount] = useState('');
  const [symbol, setSymbol] = useState('BTC');
  const [convert, setConvert] = useState('USD');
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [loading, setLoading] = useState(false);

  const debouncedAmount = useDebounce(amount, 100);
  const debouncedConvert = useDebounce(convert, 100);
  const debouncedSymbol = useDebounce(symbol, 100);

  const BACKEND_URL = "https://curcrypto.onrender.com"

  useEffect(() => {
    axios.get(`${BACKEND_URL}/topCryptos`)
      .then((response) => setCryptocurrencies(response.data.data))
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    if (debouncedAmount !== '' && debouncedAmount > 0) {
          setConvertedAmount("")

      setLoading(true);

      axios.post(`${BACKEND_URL}/convertCurrency`, {
        symbol: debouncedSymbol,
        amount: debouncedAmount,
        convert: debouncedConvert,
      })
        .then((response) => setConvertedAmount(`${response.data.convertedAmount}`))
        .catch((error) => console.error(error))
        .finally(() => setLoading(false));
    } else {
      setConvertedAmount(null);
    }
  }, [debouncedAmount, debouncedConvert, debouncedSymbol]);

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <div className="crypto-form">
            <h1 className="text-center mb-4">Cryptocurrency Converter</h1>
            <Form>
              <Row className="mb-3">
                <Col xs={4}>
                  <Form.Label>Amount</Form.Label>
                </Col>
                <Col xs={8}>
                  <Form.Control
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </Col>
              </Row>

              <Row className="mb-3">
                <Col xs={4}>
                  <Form.Label>Source Cryptocurrency</Form.Label>
                </Col>
                <Col xs={8}>
                  <Form.Control
                    as="select"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                  >
                    {cryptocurrencies.map((crypto) => (
                      <option key={crypto.id} value={crypto.symbol}>
                        {crypto.name} ({crypto.symbol})
                      </option>
                    ))}
                  </Form.Control>
                </Col>
              </Row>
              <Row>
                <Col xs={4}>
                  <Form.Label>Target Currency</Form.Label>
                </Col>
                <Col xs={8}>
                  <Form.Control
                    as="select"
                    value={convert}
                    onChange={(e) => setConvert(e.target.value)}
                  >
                    {currencies.map((cur, index) => (
                      <option key={index} value={cur}>
                        {cur}
                      </option>
                    ))}
                  </Form.Control>
                </Col>
              </Row>
            </Form>

            <div className="converted-amount mt-3">
              <h4 className="text-center">Converted Amount:</h4>
              {loading ? (
                <Spinner animation="border" variant="primary" />
              ) : (
                <p className="text-center">{`${convertedAmount} ${symbol}`}</p>
              )}
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default CryptoConverter;
