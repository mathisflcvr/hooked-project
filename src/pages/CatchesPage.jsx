import { useState, useEffect } from 'react';
import { Card, List, Button, Modal, Form, Input, Select, Upload, message, Empty } from 'antd';
import { UploadOutlined, CameraOutlined } from '@ant-design/icons';
import { storageService } from '../services/storageService';
import { createCatch } from '../models/dataModels';
import { FISH_TYPES } from '../models/dataModels';

const { TextArea } = Input;

// Traduction des types de poissons
const FISH_TYPES_FR = {
  [FISH_TYPES.PIKE]: 'Brochet',
  [FISH_TYPES.ZANDER]: 'Sandre',
  [FISH_TYPES.TROUT]: 'Truite',
  [FISH_TYPES.BASS]: 'Bar',
  [FISH_TYPES.CARP]: 'Carpe',
  [FISH_TYPES.CATFISH]: 'Silure'
};

const CatchesPage = () => {
  const [catches, setCatches] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const loadedCatches = storageService.getCatches();
    setCatches(loadedCatches);
  }, []);

  const handleAddCatch = () => {
    form.validateFields().then((values) => {
      const newCatch = createCatch({
        ...values,
        createdBy: 'currentUser', // À remplacer par l'ID de l'utilisateur connecté
        photo: values.photo?.[0]?.thumbUrl || null,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      });

      storageService.addCatch(newCatch);
      setCatches([...catches, newCatch]);
      setIsModalVisible(false);
      form.resetFields();
      message.success('Capture ajoutée avec succès !');
    });
  };

  const getSpotName = (spotId) => {
    const spot = storageService.getSpots().find(s => s.id === spotId);
    return spot ? spot.name : 'Spot inconnu';
  };

  const uploadProps = {
    name: 'file',
    action: 'https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188',
    headers: {
      authorization: 'authorization-text',
    },
    listType: 'picture',
    beforeUpload: (file) => {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        message.error('Vous ne pouvez télécharger que des fichiers JPG/PNG !');
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('L\'image doit être inférieure à 2MB !');
      }
      return isJpgOrPng && isLt2M;
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} téléchargé avec succès`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} échec du téléchargement.`);
      }
    },
  };

  return (
    <div>
      <Card
        title="Mes Captures"
        extra={
          <Button type="primary" icon={<CameraOutlined />} onClick={() => setIsModalVisible(true)}>
            Ajouter une capture
          </Button>
        }
        style={{ borderRadius: '8px' }}
      >
        {catches.length === 0 ? (
          <Empty
            description="Vous n'avez pas encore enregistré de captures"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <List
            itemLayout="vertical"
            dataSource={catches}
            renderItem={(item) => (
              <List.Item
                key={item.id}
                style={{ 
                  background: '#f9f9f9', 
                  borderRadius: '8px', 
                  padding: '16px', 
                  marginBottom: '16px' 
                }}
                extra={
                  item.photo && (
                    <img
                      width={200}
                      alt="capture de poisson"
                      src={item.photo}
                      style={{ borderRadius: '8px' }}
                    />
                  )
                }
              >
                <List.Item.Meta
                  title={`${FISH_TYPES_FR[item.fishType] || item.fishType} - ${new Date(item.createdAt).toLocaleDateString()}`}
                  description={
                    <>
                      <p><strong>Spot:</strong> {getSpotName(item.spotId)}</p>
                      <p><strong>Appât:</strong> {item.bait}</p>
                      <p><strong>Technique:</strong> {item.technique}</p>
                      <p><strong>Météo:</strong> {item.weather}</p>
                      {item.weight && <p><strong>Poids:</strong> {item.weight} kg</p>}
                      {item.length && <p><strong>Taille:</strong> {item.length} cm</p>}
                      {item.notes && <p><strong>Notes:</strong> {item.notes}</p>}
                    </>
                  }
                />
              </List.Item>
            )}
            pagination={{
              pageSize: 5,
              hideOnSinglePage: true,
            }}
          />
        )}
      </Card>

      <Modal
        title="Ajouter une capture"
        open={isModalVisible}
        onOk={handleAddCatch}
        onCancel={() => setIsModalVisible(false)}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="fishType"
            label="Type de poisson"
            rules={[{ required: true, message: 'Veuillez sélectionner un type' }]}
          >
            <Select>
              {Object.entries(FISH_TYPES_FR).map(([key, value]) => (
                <Select.Option key={key} value={key}>
                  {value}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="spotId"
            label="Spot de pêche"
            rules={[{ required: true, message: 'Veuillez sélectionner un spot' }]}
          >
            <Select>
              {storageService.getSpots().map((spot) => (
                <Select.Option key={spot.id} value={spot.id}>
                  {spot.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="photo"
            label="Photo"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e?.fileList;
            }}
          >
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>Télécharger une photo</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="bait"
            label="Appât utilisé"
            rules={[{ required: true, message: 'Veuillez entrer l\'appât utilisé' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="technique"
            label="Technique utilisée"
            rules={[{ required: true, message: 'Veuillez entrer la technique utilisée' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="weather"
            label="Conditions météo"
            rules={[{ required: true, message: 'Veuillez entrer les conditions météo' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="weight" label="Poids (kg)">
            <Input type="number" step="0.1" />
          </Form.Item>

          <Form.Item name="length" label="Taille (cm)">
            <Input type="number" />
          </Form.Item>

          <Form.Item name="notes" label="Notes">
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CatchesPage; 