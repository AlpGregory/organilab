import time

from django.core.management import BaseCommand
import requests
from django.core.files.base import ContentFile

from ._utils import load_pictograms
from sga.models import Pictogram, DangerIndication, WarningWord


def get_pictogram(klass, url):
    name = url.split('/')[-1]
    headers = {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:100.0) Gecko/20100101 Firefox/100.0'
    }
    response = requests.get(url, headers=headers)
    return ContentFile(response.content, name=name)

class Command(BaseCommand):
    help = 'Load Pictograms'
    PICTOGRAMS = {}

    def title_warning_word(self):
        for ww in WarningWord.objects.all():
            ww.name = ww.name.title()
            ww.save()

    def load_pictograms(self):
        load_pictograms(WarningWord, Pictogram, get_pictogram, self.PICTOGRAMS)

    def sync_pictogram_with_dangerindication(self):
        if not self.PICTOGRAMS:
            for pictogram in Pictogram.objects.all():
                self.PICTOGRAMS[pictogram.name] = pictogram

        CodIndPeligro = {
            'GHS01 -Bomba Explotando - Explosivo': [
                'H200', 'H201', 'H202', 'H203', 'H204', 'H240', 'H241'
            ],
            'GHS02 -Llama - Inflamable': [
                'H220', 'H232', 'H222', 'H229', 'H223', 'H229', 'H224', 'H225', 'H226',
                'H228', 'H241', 'H242', 'H250', 'H251', 'H252', 'H260', 'H261',
                'H206', 'H207', 'H208'
            ],
             'GHS03 -Llama sobre círculo - Oxidante': [
                'H270', 'H271', 'H272'
            ],
            'GHS04 -Botella de Gas - Gas Presurizado': [
                'H280', 'H281'
            ],
            'GHS05 -Corrosión - Corrosivo': [
                'H290', 'H314', 'H318'
            ],
            'GHS06 -Calavera y Tibias Cruzadas - Veneno o peligro de muerte': [
                'H300', 'H310', 'H330', 'H301', 'H311', 'H331'
            ],
            'GHS07 -Signo de Exclamación - Irritante': [
                'H302', 'H312', 'H332', 'H315', 'H319', 'H317', 'H335', 'H336', 'H420'
            ],
            'GHS08 -Pecho agrietado - Peligro para la Salud, Mutagénico, Cancerígeno, Reprotóxico': [
                'H334', 'H340', 'H341', 'H350', 'H351', 'H360', 'H361', 'H370', 'H371',
                'H372', 'H373', 'H304', 'H305'
            ],
            'GHS09 -Medio Ambiente - Dañino para el ambiente': [
                'H400', 'H410', 'H411',
            ]
        }

        for pict_name in CodIndPeligro:
            pictogram = self.PICTOGRAMS[pict_name]
            for di in DangerIndication.objects.filter(code__in=CodIndPeligro[pict_name]):
                di.pictograms.add(pictogram)

    def handle(self, *args, **options):
        self.load_pictograms()
        self.sync_pictogram_with_dangerindication()
        self.title_warning_word()

