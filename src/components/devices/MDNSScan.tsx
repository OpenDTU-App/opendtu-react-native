import type { FC } from 'react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList } from 'react-native';
import { Box } from 'react-native-flex-layout';
import { ActivityIndicator, Text } from 'react-native-paper';
import type { Service } from 'react-native-zeroconf';
import Zeroconf from 'react-native-zeroconf';

import MDNSScanItem from '@/components/devices/MDNSScanItem';

export interface MDNSScanProps {
  setError: (error: string) => void;
  setLoading: (loading: boolean) => void;
  loading: boolean;
}

const MDNSScan: FC<MDNSScanProps> = ({ setError, setLoading, loading }) => {
  const { t } = useTranslation();

  const [discovering, setDiscovering] = useState<boolean>(false);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const zeroconf = new Zeroconf();

    zeroconf.on('start', () => {
      setDiscovering(true);
    });

    zeroconf.on('stop', () => {
      setDiscovering(false);
    });

    zeroconf.on('error', (error: Error) => {
      console.log('error', error);
    });

    zeroconf.on('found', (service: string) => {
      console.log('found', service);
    });

    zeroconf.on('remove', (service: string) => {
      console.log('remove', service);
      setServices(prevServices =>
        prevServices.filter(prevService => prevService.name !== service),
      );
    });

    zeroconf.on('update', () => {
      console.log('update');
    });

    zeroconf.on('resolved', (service: Service) => {
      console.log('resolved', service);
      setServices(prevServices => [...prevServices, service]);
    });

    zeroconf.scan('opendtu', 'tcp', 'local.');

    return () => {
      zeroconf.stop();
      zeroconf.removeAllListeners();
      setDiscovering(false);
      setServices([]);
    };
  }, []);

  if (discovering && services.length === 0) {
    return (
      <Box
        style={{
          marginTop: 16,
          marginBottom: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
        }}
      >
        <Text>{t('mdns.scanning')}</Text>
        <ActivityIndicator animating={true} />
      </Box>
    );
  }

  if (!discovering && services.length === 0) {
    return (
      <Text style={{ marginTop: 16, marginBottom: 8, textAlign: 'center' }}>
        {t('mdns.noDevicesFound')}
      </Text>
    );
  }

  return (
    <FlatList
      data={services}
      renderItem={({ item }) => (
        <MDNSScanItem
          service={item}
          setError={setError}
          setLoading={setLoading}
          loading={loading}
        />
      )}
      keyExtractor={item => item.name}
    />
  );
};

export default MDNSScan;
