import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Modal } from "bootstrap";
import { useDispatch } from "react-redux";
import { pushMessage } from "../redux/toastSlice";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

function ProductModal({
  modalMode,
  tempProduct,
  isOpen,
  setIsOpen,
  getProducts,
}) {
  const productModalRef = useRef(null);
  const [modalData, setModalData] = useState(tempProduct);

  const dispatch = useDispatch();

  useEffect(() => {
    setModalData({
      ...tempProduct,
    });
  }, [tempProduct]);

  useEffect(() => {
    new Modal(productModalRef.current, { backdrop: false });
  }, []);

  useEffect(() => {
    if (isOpen) {
      const modalInstance = Modal.getInstance(productModalRef.current);
      modalInstance.show();
    }
  }, [isOpen]);

  const handleCloseProductModal = () => {
    const modalInstance = Modal.getInstance(productModalRef.current);
    modalInstance.hide();
    setIsOpen(false);
  };

  const handleModalInputChange = (e) => {
    const { value, name, checked, type } = e.target;

    setModalData({
      ...modalData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageChange = (e, index) => {
    const { value } = e.target;
    const newImages = [...modalData.imagesUrl];
    newImages[index] = value;
    setModalData({
      ...modalData,
      imagesUrl: newImages,
    });
  };

  const handleAddImage = () => {
    const newImages = [...modalData.imagesUrl, ""];
    setModalData({
      ...modalData,
      imagesUrl: newImages,
    });
  };
  const handleRemoveImage = () => {
    const newImages = [...modalData.imagesUrl];
    newImages.pop();
    setModalData({
      ...modalData,
      imagesUrl: newImages,
    });
  };

  const createProduct = async () => {
    try {
      await axios.post(`${BASE_URL}/v2/api/${API_PATH}/admin/product`, {
        data: {
          ...modalData,
          origin_price: Number(modalData.origin_price),
          price: Number(modalData.price),
          is_enabled: modalData.is_enabled ? 1 : 0,
        },
      });
      dispatch(
        pushMessage({
          text: "新增成功",
          status: "success",
        })
      );
    } catch (error) {
      dispatch(
        pushMessage({
          text: error.response.data.message,
          status: "failed",
        })
      );
      throw new Error(error.response.data.message);
    }
  };

  const updateProduct = async () => {
    try {
      await axios.put(
        `${BASE_URL}/v2/api/${API_PATH}/admin/product/${modalData.id}`,
        {
          data: {
            ...modalData,
            origin_price: Number(modalData.origin_price),
            price: Number(modalData.price),
            is_enabled: modalData.is_enabled ? 1 : 0,
          },
        }
      );
      dispatch(
        pushMessage({
          text: "修改成功",
          status: "success",
        })
      );
    } catch (error) {
      dispatch(
        pushMessage({
          text: error.response.data.message,
          status: "failed",
        })
      );
      throw new Error(error.response.data.message);
    }
  };

  const handleUpdateProduct = async () => {
    const apiCall = modalMode === "create" ? createProduct : updateProduct;
    try {
      await apiCall();
      getProducts();
      handleCloseProductModal();
    } catch (error) {
      console.error(error);
    } finally {
      handleCloseProductModal();
    }
  };

  const handleFileChange = async (e) => {
    console.log(e.target);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file-to-upload", file);
    try {
      const res = await axios.post(
        `${BASE_URL}/v2/api/${API_PATH}/admin/upload`,
        formData
      );
      const uploadedImageUrl = res.data.imageUrl;

      setModalData({
        ...modalData,
        imageUrl: uploadedImageUrl,
      });
    } catch (error) {
      dispatch(
        pushMessage({
          text: error.response.data.message,
          status: "failed",
        })
      );
    }
  };

  return (
    <div
      id="productModal"
      className="modal"
      ref={productModalRef}
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content border-0 shadow">
          <div className="modal-header border-bottom">
            <h5 className="modal-title fs-4">
              {modalMode === "create" ? "新增產品" : "編輯產品"}
            </h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={handleCloseProductModal}
            ></button>
          </div>

          <div className="modal-body p-4">
            <div className="row g-4">
              <div className="col-md-4">
                <div className="mb-5">
                  <label htmlFor="fileInput" className="form-label">
                    {" "}
                    圖片上傳{" "}
                  </label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    className="form-control"
                    id="fileInput"
                    onChange={handleFileChange}
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="primary-image" className="form-label">
                    主圖
                  </label>
                  <div className="input-group">
                    <input
                      name="imageUrl"
                      type="text"
                      id="primary-image"
                      className="form-control"
                      placeholder="請輸入圖片連結"
                      value={modalData.imageUrl}
                      onChange={handleModalInputChange}
                    />
                  </div>
                  <img
                    src={modalData.imageUrl}
                    alt={modalData.title}
                    className="img-fluid"
                  />
                </div>

                {/* 副圖 */}
                <div className="border border-2 border-dashed rounded-3 p-3">
                  {modalData.imagesUrl?.map((image, index) => (
                    <div key={index} className="mb-2">
                      <label
                        htmlFor={`imagesUrl-${index + 1}`}
                        className="form-label"
                      >
                        副圖 {index + 1}
                      </label>
                      <input
                        value={image}
                        onChange={(e) => handleImageChange(e, index)}
                        id={`imagesUrl-${index + 1}`}
                        type="text"
                        placeholder={`圖片網址 ${index + 1}`}
                        className="form-control mb-2"
                      />
                      {image && (
                        <img
                          src={image}
                          alt={`副圖 ${index + 1}`}
                          className="img-fluid mb-2"
                        />
                      )}
                    </div>
                  ))}
                  <div className="btn-group w-100">
                    {modalData.imagesUrl.length < 5 &&
                      modalData.imagesUrl[modalData.imagesUrl.length - 1] !=
                        "" && (
                        <button
                          onClick={handleAddImage}
                          className="btn btn-outline-primary btn-sm w-100"
                        >
                          新增圖片
                        </button>
                      )}
                    {modalData.imagesUrl.length > 1 && (
                      <button
                        onClick={handleRemoveImage}
                        className="btn btn-outline-danger btn-sm w-100"
                      >
                        取消圖片
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-md-8">
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">
                    標題
                  </label>
                  <input
                    name="title"
                    id="title"
                    type="text"
                    className="form-control"
                    placeholder="請輸入標題"
                    value={modalData.title}
                    onChange={handleModalInputChange}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="category" className="form-label">
                    分類
                  </label>
                  <input
                    name="category"
                    id="category"
                    type="text"
                    className="form-control"
                    placeholder="請輸入分類"
                    value={modalData.category}
                    onChange={handleModalInputChange}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="unit" className="form-label">
                    單位
                  </label>
                  <input
                    name="unit"
                    id="unit"
                    type="text"
                    className="form-control"
                    placeholder="請輸入單位"
                    value={modalData.unit}
                    onChange={handleModalInputChange}
                  />
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label htmlFor="origin_price" className="form-label">
                      原價
                    </label>
                    <input
                      name="origin_price"
                      id="origin_price"
                      type="number"
                      className="form-control"
                      placeholder="請輸入原價"
                      min={0}
                      value={modalData.origin_price}
                      onChange={handleModalInputChange}
                    />
                  </div>
                  <div className="col-6">
                    <label htmlFor="price" className="form-label">
                      售價
                    </label>
                    <input
                      name="price"
                      id="price"
                      type="number"
                      className="form-control"
                      placeholder="請輸入售價"
                      min={0}
                      value={modalData.price}
                      onChange={handleModalInputChange}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">
                    產品描述
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    className="form-control"
                    rows={4}
                    placeholder="請輸入產品描述"
                    value={modalData.description}
                    onChange={handleModalInputChange}
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label htmlFor="content" className="form-label">
                    說明內容
                  </label>
                  <textarea
                    name="content"
                    id="content"
                    className="form-control"
                    rows={4}
                    placeholder="請輸入說明內容"
                    value={modalData.content}
                    onChange={handleModalInputChange}
                  ></textarea>
                </div>

                <div className="form-check">
                  <input
                    name="is_enabled"
                    type="checkbox"
                    className="form-check-input"
                    id="isEnabled"
                    checked={modalData.is_enabled}
                    onChange={handleModalInputChange}
                  />
                  <label className="form-check-label" htmlFor="isEnabled">
                    是否啟用
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer border-top bg-light">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCloseProductModal}
            >
              取消
            </button>
            <button
              onClick={handleUpdateProduct}
              type="button"
              className="btn btn-primary"
            >
              確認
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductModal;
