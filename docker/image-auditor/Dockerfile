FROM node:4.3.1
MAINTAINER Marco Monzione <marco.monzione@heig-vd.ch>

#
# When we build the image, we copy the executable jar in the image file system. 
#
COPY src /opt/app/

EXPOSE 2205

CMD ["node", "/opt/app/auditor.js"]

