'use client';
import { useState } from 'react';

export default function Home() {
  // useStateを使った状態管理
  const [productCode, setProductCode] = useState('');
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [purchaseErrorMessage, setPurchaseErrorMessage] = useState('');

  // 購入リストの状態管理
  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showPopup, setShowPopup] = useState(false);


  // 環境変数の読み取り
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // 商品検索処理
  const handleGetProduct = async() => {
    if (!productCode) {
      setErrorMessage('商品コードを入力してください');
      setProductName('');
      setProductPrice('');
      return;
    }
    setErrorMessage('');
    try{
      const response = await fetch(`${apiUrl}/products/${productCode}`);
      const data = await response.json();
      // エラーの場合
      if(!response.ok){
        setProductName(data.detail); // エラーの`detail` を productName にセット
        setProductPrice('');
        return;
      }
      // 商品が見つかった場合
      setProductName(data.name);
      setProductPrice(data.price);
    } catch (error) {
      console.log('Error:',error);
      setErrorMessage('サーバーに接続できませんでした');
    }
  };

  // 購入リスト追加処理
  const handleAddCart = async() => {
    // 商品検索結果がなければカートに追加しない
    if(!productName || !productPrice){
      setErrorMessage('商品コードを読み込んでください');
      return;
    }
    // 検索結果があったら、カートに追加する
    const newCart = [...cart,{code:productCode, name:productName, price:productPrice, quantity:1}];
    setCart(newCart);
    // その上で入力欄をクリア
    setProductCode('');
    setProductName('');
    setProductPrice('');
  }

  // 購入処理
  const handlePurchase = async() => {
    if (cart.length === 0) {
      setErrorMessage('購入リストが空です');
      return;
    }

    // APIリクエスト
    try {
      const response = await fetch('http://localhost:8000/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart }),
      });
      const data = await response.json();

      if (!response.ok){
        setPurchaseErrorMessage(data.detail);
      }

      // 購入完了 → ポップアップ表示
      setTotalPrice(data.total);
      setShowPopup(true);

    } catch (error) {
      console.log('Error:', error);
      setPurchaseErrorMessage('購入処理に失敗しました');
    }
  };

  // 購入完了後のリセット
  const handlePopupClose = () => {
    setShowPopup(false);
    setCart([]);
    setProductCode('');
    setProductName('');
    setProductPrice('');
    setTotalPrice(0); // クリア
  };

  return (
    <div className="flex flex-row items-center justify-center h-screen bg-gray-100 p-6 text-black">
      <div className="flex flex-row gap-10 items-end w-2/3">
        {/* 左側: 商品検索 */}
        <div className="w-1/2 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            <input
              type="text"
              value={productCode}
              onChange={(e) => setProductCode(e.target.value)}
              placeholder="商品コードを入力"
              className="border border-black bg-white p-2 text-lg "
              onKeyDown={(e) => e.key === 'Enter' && handleGetProduct()} // Enter キーで実行
            />
            <button
              onClick={handleGetProduct}
              className="border-2 border-black bg-blue-300 hover:bg-blue-400 p-2 font-bold"
            >
              商品コード 読み込み
            </button>
          </div>
          <div className="mt-4 flex flex-col gap-1">
            <div className="border border-black p-2 text-lg w-full">
              {productName ? productName : "商品名"}
            </div>
            <div className="border border-black p-2 text-lg w-full">
              {productPrice ? `${productPrice}円` : "単価"}
            </div>
            <button
              onClick={handleAddCart}
              className="border-2 border-black bg-blue-300 hover:bg-blue-400 p-2 font-bold"
            >
              追加
            </button>
          </div>
        </div>

        {/* 右側: 購入リスト */}
        <div className="w-1/2 flex flex-col gap-4">
          <h2 className="text-xl font-bold mb-2 text-center">購入リスト</h2>
          <div className="flex flex-col gap-2">
            <div className="border border-black p-4">
              {/* cart の中身を map で表示 */}
              {cart.length === 0 ? (
                <p className="text-gray-500">購入リストは空です</p>
              ) : (
                <div className="flex flex-col gap-1">
                  {cart.map((item, index) => (
                    <p key={index} className="text-lg">
                      {item.name} x{item.quantity} {item.price}円 {item.price * item.quantity}円
                    </p>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={handlePurchase}
              className="border-2 border-black bg-blue-300 hover:bg-blue-400 p-2 font-bold"
            >
              購入
            </button>
            {purchaseErrorMessage && <p className="text-red-500">{purchaseErrorMessage}</p>}
          </div>
        </div>

        {/* 購入完了ポップアップ */}
        {showPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg w-80">
              <p className="text-lg">購入完了！ 合計 {totalPrice}円（税込）</p>
              <hr className="my-4 border-gray-300" />
              <div className="flex justify-end">
                <button
                  onClick={handlePopupClose}
                  className="text-blue-500 font-bold"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}