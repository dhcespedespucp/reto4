import json
import boto3
import cv2
import numpy as np

bucket_name = 'reto426282917d98c46ebadb889980ce12f6e-dev'
logo_prefix = 'private/us-east-1:ad4eb8cc-2cdb-45eb-96c7-edf9ac37cf4d/logo'
tmp_logofilename = '/tmp/logo.jpg'
tmp_docfilename = '/tmp/doc.jpg'

s3 = boto3.client('s3')
s3_res = boto3.resource('s3')

def lambda_handler(event, context):
    #print(event)
    
    #Obtener el listado de logos
    logo_bucket = s3.list_objects_v2(
        Bucket = bucket_name,
        Prefix = logo_prefix
    )
    
    s3_res.Bucket(bucket_name).download_file('private/us-east-1:ad4eb8cc-2cdb-45eb-96c7-edf9ac37cf4d/input/ebba6e81-3915-4a55-bf82-ae49c87090e7.jpg', tmp_docfilename)
    doc_image = cv2.imread(tmp_logofilename, cv2.IMREAD_GRAYSCALE)
    
    #Iteramos los logos para validar con quien cumple
    for logo_object in logo_bucket['Contents']:
        print(logo_object['Key'])
        if logo_object['Key'] != 'private/us-east-1:ad4eb8cc-2cdb-45eb-96c7-edf9ac37cf4d/logo/':
            print('entro!!!')
            try:
                s3_res.Bucket(bucket_name).download_file(logo_object['Key'], tmp_logofilename)
            except botocore.exceptions.ClientError as e:
                raise
            logo_image = cv2.imread(tmp_logofilename, cv2.IMREAD_GRAYSCALE)
            result = cv2.matchTemplate(doc_image, logo_image, cv2.TM_CCOEFF_NORMED)
            print(result)
            loc = np.where(result >= 0.2)
            print(loc)
            
            #cv2.destroyAllWindows()
    
    return {
        'statusCode': 200,
        'body': 'prueba'
    }

#objDocument = s3.get_object(Bucket='reto426282917d98c46ebadb889980ce12f6e-dev', Key='private/us-east-1:ad4eb8cc-2cdb-45eb-96c7-edf9ac37cf4d/input/ebba6e81-3915-4a55-bf82-ae49c87090e7.jpg')
#print(objDocument)